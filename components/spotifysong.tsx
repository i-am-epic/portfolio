import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const SpotifyGuessSong = () => {
    const [lastPlayed, setLastPlayed] = useState(null);
    const [options, setOptions] = useState([]);
    const [selectedSong, setSelectedSong] = useState("");
    const [score, setScore] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [previewAvailable, setPreviewAvailable] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Initialize audio only on client side
            audioRef.current = new Audio();
        }
        fetchSpotifyData();
    }, []);

    const fetchSpotifyData = async () => {
        try {
            const res = await fetch("/api/spotify");
            const data = await res.json();
            console.log("Spotify data:", data);
            // Search for the first track with a valid preview URL
            const trackWithPreview = data.lastPlayed.find(item => item.track.preview_url);
            console.log("trackWithPreview:", trackWithPreview);
            if (trackWithPreview) {
                setLastPlayed(trackWithPreview);
                setPreviewAvailable(true);
            } else {
                // Fall back to the first track and indicate no preview available
                setLastPlayed(data.lastPlayed[0] || null);
                setPreviewAvailable(false);
            }
            setOptions(Array.isArray(data.lastPlayed)
                ? data.lastPlayed.map(song => ({ id: song.track.id, name: song.track.name }))
                : []);
        } catch (error) {
            console.error("Error fetching Spotify data:", error);
            setOptions([]);
        }
    };

    const startGame = () => {
        setStartTime(Date.now());
        playPreview();
    };

    const playPreview = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ""; // Reset previous audio
        }

        if (lastPlayed?.track?.preview_url) {
            audioRef.current.src = lastPlayed.track.preview_url;
            audioRef.current.play().then(() => {
                console.log("Audio is playing.");
            }).catch(err => {
                console.error("Error playing audio:", err);
            });
            audioRef.current.onended = () => console.log("Preview ended");
        } else {
            console.warn("No preview URL available");
        }
    };

    const checkAnswer = () => {
        if (selectedSong === lastPlayed?.track?.name) {
            const timeTaken = (Date.now() - startTime) / 1000;
            setScore(Math.max(100 - timeTaken * 10, 0));
        }
    };

    return (
        <motion.div
            className="p-6 bg-black text-white rounded-lg shadow-md w-96 mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-center text-green-500">🎵 Guess the Song</h2>
            <p className="text-sm text-center mt-2 text-gray-400">
                Last Played: <span className="font-semibold text-white">{lastPlayed?.track?.name || "None"}</span>
            </p>

            {!previewAvailable && (
                <p className="text-xs text-center text-red-500 mt-2">Preview not available for this track, sorry!</p>
            )}

            <div className="flex flex-col items-center mt-4">
                <button
                    onClick={startGame}
                    className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md transition w-full"
                >
                    ▶ Play Preview
                </button>

                <select
                    value={selectedSong}
                    onChange={(e) => setSelectedSong(e.target.value)}
                    className="mt-3 p-2 border border-gray-600 rounded-md bg-gray-800 text-white w-full"
                >
                    <option value="" disabled>Select the song</option>
                    {options.length > 0 ? (
                        options.map((song) => (
                            <option key={song.id} value={song.name}>{song.name}</option>
                        ))
                    ) : (
                        <option disabled>No options available</option>
                    )}
                </select>

                <button
                    onClick={checkAnswer}
                    className="mt-3 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md transition w-full"
                >
                    ✅ Submit Answer
                </button>
            </div>

            {score !== null && (
                <motion.p
                    className="mt-4 text-center font-bold text-green-400 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    🎯 Your Score: {score.toFixed(2)}
                </motion.p>
            )}
        </motion.div>
    );
};

export default SpotifyGuessSong;
