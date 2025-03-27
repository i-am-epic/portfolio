import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BentoGrid } from "@/components/bento-grid";
import { BentoGridItem } from "@/components/bento-grid-item";

// Basic similarity function for bonus checking (optional)
const computeSimilarity = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  let matches = 0;
  for (let char of s1) {
    if (s2.includes(char)) matches++;
  }
  return (matches / s2.length) * 100;
};

const SongGuessGame = () => {
  // State for song queue
  const [currentSong, setCurrentSong] = useState(null);
  const [nextSong, setNextSong] = useState(null);
  
  // Session/game state (5 songs per session)
  const [songsPlayed, setSongsPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Per-song state
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]); // all guesses for current song
  const [attempts, setAttempts] = useState(0);
  const [songScore, setSongScore] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [gameOver, setGameOver] = useState(false); // for current song
  const [revealedAnswer, setRevealedAnswer] = useState(null);

  // Controls for preview stages
  const [currentStage, setCurrentStage] = useState(0); // stage index: 0...5
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const [fullPlayback, setFullPlayback] = useState(false);

  // Global game control
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [genre, setGenre] = useState("pop");

  // Preview stages (in seconds): 1, 3, 5, 8, 15, 30
  const previewStages = [1, 3, 5, 8, 15, 30];
  const maxGuessPerSong = 10;
  const maxSongs = 5;
  const maxPreviewTime = previewStages[previewStages.length - 1]; // 30 seconds

  const audioRef = useRef(null);
  const segmentTimeoutRef = useRef(null);

  // Replace with your actual Jamendo API client_id
  const clientId = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID;
  // When game starts, create audio ref and fetch initial songs.
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
    }
    if (gameStarted) {
      // Fetch current and next song concurrently
      fetchTwoSongs();
    }
    return () => {
      if (segmentTimeoutRef.current) clearTimeout(segmentTimeoutRef.current);
    };
  }, [gameStarted, genre]);
  // Hint button: displays a small bulb icon on top right of preview block.
  const useHint = () => {
    setHintUsed(true);
    alert(`Hint: The artist is ${song?.artist_name}`);
  };
  // Fetch two songs (current and next) from Jamendo API.
  const fetchTwoSongs = async () => {
    setIsLoading(true);
    try {
      // Fetch songs with filters: top 20 latest and top 60 popular songs with >50M listens (lang=en)
      const latestRes = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=20&lang=en&tags=${genre}&min_listens_total=50000000&order=releasedate_desc`
      );
      const popularRes = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=60&lang=en&tags=${genre}&min_listens_total=50000000&order=popularity_total_desc`
      );
      const latestData = await latestRes.json();
      const popularData = await popularRes.json();
      const combined = [
        ...(latestData.results || []),
        ...(popularData.results || [])
      ];
      if (combined.length > 0) {
        // Randomly select two distinct songs.
        const randomIndex1 = Math.floor(Math.random() * combined.length);
        let randomIndex2 = Math.floor(Math.random() * combined.length);
        while (randomIndex2 === randomIndex1 && combined.length > 1) {
          randomIndex2 = Math.floor(Math.random() * combined.length);
        }
        const song1 = combined[randomIndex1];
        const song2 = combined[randomIndex2];
        // Preload both songs.
        if (audioRef.current) {
          // Preload current song
          audioRef.current.src = song1.audio;
          audioRef.current.load();
          await new Promise((resolve) => {
            audioRef.current.onloadeddata = resolve;
          });
        }
        setCurrentSong(song1);
        setNextSong(song2);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
    // Dummy loader delay of 1 second
    setTimeout(() => setIsLoading(false), 100);
  };

  // When moving to next song, shift nextSong to currentSong and fetch new nextSong.
  const loadNextSong = async () => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsLoading(true);
    // Set current song to nextSong
    setCurrentSong(nextSong);
    // Reset per-song states
    setGuesses([]);
    setAttempts(0);
    setSongScore(null);
    setCurrentStage(0);
    setPreviewUnlocked(false);
    setFullPlayback(false);
    setStartTime(Date.now());
    setGameOver(false);
    setRevealedAnswer(null);
    // Fetch a new next song in background
    try {
      const latestRes = await fetch(
        'https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=20&lang=en&tags=${genre}&order=popularity_month_desc&order=listens_total_desc'
    );
      const popularRes = await fetch(
        'https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=50&lang=en&tags=${genre}&order=popularity_total_desc&order=listens_total_desc'
      );
      const latestData = await latestRes.json();
      const popularData = await popularRes.json();
      const combined = [
        ...(latestData.results || []),
        ...(popularData.results || [])
      ];
      if (combined.length > 0) {
        const randomIndex = Math.floor(Math.random() * combined.length);
        const newSong = combined[randomIndex];
        setNextSong(newSong);
      }
    } catch (error) {
      console.error("Error fetching next song:", error);
    }
    setIsLoading(false);
    // Start playing the current song's preview
    playCurrentStage();
  };

  // Start game: fetch two songs and start playing current song.
  const startGame = () => {
    setGameStarted(true);
    setSongsPlayed(0);
    setTotalScore(0);
    setIsLoading(true);
    setTimeout(() => {
      fetchTwoSongs().then(() => {
        setStartTime(Date.now());
        playCurrentStage();
      });
    }, 100);
  };

  // Play current preview stage for currentSong.
  const playCurrentStage = () => {
    if (!currentSong?.audio) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const stageDuration = previewStages[currentStage];
    audioRef.current.src = currentSong.audio;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(err => console.error("Error playing audio:", err));
    segmentTimeoutRef.current = setTimeout(() => {
      audioRef.current.pause();
      if (currentStage === 0) setPreviewUnlocked(true);
    }, stageDuration * 1000);
  };

  // "Listen More": advance one stage at a time.
  const unlockNextStage = () => {
    if (!currentSong?.audio) return;
    if (currentStage < previewStages.length - 1) {
      const nextStage = currentStage + 1;
      setCurrentStage(nextStage);
      if (segmentTimeoutRef.current) clearTimeout(segmentTimeoutRef.current);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      const stageDuration = previewStages[nextStage];
      audioRef.current.src = currentSong.audio;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Error in unlockNextStage:", err));
      segmentTimeoutRef.current = setTimeout(() => {
        audioRef.current.pause();
      }, stageDuration * 1000);
    } else {
      // After last preview stage, enable full playback (but don't count for score)
      setFullPlayback(true);
      audioRef.current.src = currentSong.audio;
      audioRef.current.play().catch(err => console.error("Error playing full song:", err));
    }
  };

  // Replay current stage.
  const replayStage = () => {
    playCurrentStage();
  };

  // Total preview time played.
  const totalPreviewTimePlayed = () =>
    previewStages.slice(0, currentStage + 1).reduce((a, b) => a + b, 0);

  // Submit guess: allow up to 10 guesses per song.
  const submitGuess = () => {
    if (!guess.trim() || gameOver) return;
    const userGuess = guess.trim().toLowerCase();
    const correctAnswer = currentSong?.name.trim().toLowerCase();
    const newAttempt = attempts + 1;
    if (newAttempt > maxGuessPerSong) return; // limit to 10 guesses per song
    setAttempts(newAttempt);
    setGuesses(prev => [...prev, guess]);
    setGuess("");
    const similarity = computeSimilarity(userGuess, correctAnswer);
    const timeTaken = (Date.now() - startTime) / 1000;
    // If time taken exceeds 30 sec, score is 0.
    if (timeTaken > 30) {
      setSongScore(0);
      setGameOver(true);
      setRevealedAnswer(currentSong.name);
      return;
    }
    // If guess is similar enough (>=70%), it's correct.
    if (similarity >= 70) {
      // Score: 100 - (10 points per extra guess) - timeTaken.
      const currentScore = Math.max(100 - ((newAttempt - 1) * 10) - timeTaken, 0);
      setSongScore(currentScore);
      setTotalScore(prev => prev + currentScore);
      setSongsPlayed(prev => prev + 1);
      setGameOver(true);
      setRevealedAnswer(currentSong.name);
    }
  };

  // Skip button: end current song without scoring.
  const skipSong = () => {
    setSongScore(0);
    setSongsPlayed(prev => prev + 1);
    setGameOver(true);
    setRevealedAnswer(currentSong.name);
  };

  // Overall average score (after session)
  const averageScore = songsPlayed > 0 ? (totalScore / songsPlayed).toFixed(2) : 0;

  // Share score (only after 5 songs are done).
  const shareScore = () => {
    const message = `I guessed ${songsPlayed}/${maxSongs} songs with an average score of ${averageScore} and an average time of ${
      songsPlayed > 0 ? ((Date.now() - startTime) / songsPlayed / 1000).toFixed(2) : "N/A"
    }s in Song Guess Game! Check it out: https://nikboson.vercel.app/`;
    // For Twitter sharing, open a URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4">
      {/* Start Screen */}
      {!gameStarted && (
        <BentoGrid className="md:grid-cols-[100%_00%] gap-4">
          <BentoGridItem className="md:col-span-1 md:row-span-1 p-6 bg-black text-white rounded-lg shadow-md text-center">
            <motion.h2
              className="text-3xl font-bold text-green-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Guess the Song
            </motion.h2>
            <div className="mt-4">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="p-2 rounded-md bg-gray-800 text-white mb-5"
              >
                <option value ="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="hip-hop">Hip-Hop</option>
                <option value="jazz">Jazz</option>
              </select>
            </div>
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-md"
            >
              Start Game
            </button>
          </BentoGridItem>
          {isLoading && (
            <BentoGridItem className="p-4 text-center">
              <p className="text-white">Loading song...</p>
            </BentoGridItem>
          )}
        </BentoGrid>
      )}

      {/* Game Board */}
      {gameStarted && currentSong && !isLoading && (
        <BentoGrid className="md:grid-cols-[100%_00%]  gap-4">
          {/* Preview Bar with Hint */}
          <BentoGridItem className="md:col-span-2 c md:row-span-2 py-12 bg-gray-800 rounded-lg relative">
            <div className="w-full h-5 bg-gray-600 rounded-md overflow-hidden flex">
              {previewStages.map((stage, index) => {
                const widthPercent = (stage / previewStages[previewStages.length - 1]) * 100;
                return (
                  <div
                    key={index}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full border-r border-gray-500 ${index < currentStage ? "bg-green-500" : "bg-gray-400"}`}
                  ></div>
                );
              })}
            </div>
            <div className="mt-1 text-center text-xs text-gray-300">
              Preview: {previewStages[currentStage]}s / {previewStages[previewStages.length - 1]}s
            </div>
            {/* Hint button (bulb icon) with extra bottom padding */}
            <button
              onClick={useHint}
              className="absolute gap-3 top-2 right-2 pb-2 p-2 bg-yellow-500 rounded-full text-xs"
            >
              💡
            </button>
            {/* Control Buttons with spacing */}
            <div className="mt-3 flex justify-around space-x-4">
              <button
                onClick={replayStage}
                disabled={fullPlayback}
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md"
              >
                Play
              </button>
              <button
                onClick={unlockNextStage}
                disabled={!previewUnlocked || fullPlayback}
                className={`bg-blue-500 hover:bg-blue-400 text-black font-bold px-4 py-2 rounded-md ${
                  (!previewUnlocked || fullPlayback) && "opacity-50 cursor-not-allowed"
                }`}
              >
                {currentStage < previewStages.length - 1 ? "Listen More" : "Listen Full"}
              </button>
              <button
                onClick={skipSong}
                className="bg-red-500 hover:bg-red-400 text-black font-bold px-4 py-2 rounded-md"
              >
                Skip
              </button>
            </div>
            {/* Answer Reveal (shown below preview after song ends) */}
            {gameOver && revealedAnswer && (
              <div className="mt-3 p-2 bg-gray-700 rounded-md text-center text-white">
                Answer: {revealedAnswer}
                {currentSong.image && (
                  <img src={currentSong.image} alt={currentSong.name} className="mx-auto mt-2 rounded" />
                )}
              </div>
            )}
          </BentoGridItem>

          {/* Guess Chat Window */}
          <BentoGridItem className="md:col-span-2 md:row-span-2 p-4 bg-gray-900 rounded-lg">
            <div className="mb-2 text-white text-sm space-y-1 max-h-32 overflow-y-auto">
              {guesses.slice(-10).map((g, idx) => (
                <p key={idx} className="bg-gray-800 p-2 rounded-md">{`Guess ${idx + 1}: ${g}`}</p>
              ))}
            </div>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess here..."
              disabled={!previewUnlocked || fullPlayback || gameOver}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  submitGuess();
                }
              }}
            />
            <button
              onClick={submitGuess}
              disabled={!previewUnlocked || fullPlayback || gameOver}
              className={`mt-2 w-full bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md ${
                (!previewUnlocked || fullPlayback || gameOver) && "opacity-50 cursor-not-allowed"
              }`}
            >
              Submit Guess
            </button>
          </BentoGridItem>

          {/* Next Song Button (only visible when current song is finished) */}
          {gameOver && songsPlayed < maxSongs && (
            <BentoGridItem className="md:col-span-2 md:row-span-2 p-4 bg-gray-700 rounded-lg text-center">
              <button
                onClick={loadNextSong}
                className="bg-indigo-500 hover:bg-indigo-400 text-black font-bold px-6 py-3 rounded-md"
              >
                Next Song
              </button>
            </BentoGridItem>
          )}

          {/* Final Summary (only after 5 songs) */}
          {gameOver && songsPlayed === maxSongs && (
            <BentoGrid className="md:grid-cols-[100%_00%]  gap-4">
              <BentoGridItem className="p-4 bg-gray-800 text-center text-green-400 font-bold text-lg rounded-lg">
                Overall Average Score: {songsPlayed > 0 ? (totalScore / songsPlayed).toFixed(2) : 0}
              </BentoGridItem>
              <BentoGridItem className="md:col-span-2 md:row-span-2 p-4 bg-gray-800 text-center rounded-lg">
                <button
                  onClick={shareScore}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold px-4 py-2 rounded-md"
                >
                  Share Score on Twitter
                </button>
              </BentoGridItem>
            </BentoGrid>
          )}
        </BentoGrid>
      )}
    </div>
  );
};

export default SongGuessGame;
