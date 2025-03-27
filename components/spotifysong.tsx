import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BentoGrid } from "@/components/bento-grid"
import { BentoGridItem } from "@/components/bento-grid-item"

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
            audioRef.current = new Audio();
        }
        fetchSpotifyData();
    }, []);

    const fetchSpotifyData = async () => {
        try {
            const res = await fetch("/api/spotify");
            const data = await res.json();
            const trackWithPreview = data.lastPlayed.find(item => item.track.preview_url);
            
            if (trackWithPreview) {
                setLastPlayed(trackWithPreview);
                setPreviewAvailable(true);
            } else {
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
            audioRef.current.src = "";
        }

        if (lastPlayed?.track?.preview_url) {
            audioRef.current.src = lastPlayed.track.preview_url;
            audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        }
    };

    const checkAnswer = () => {
        if (selectedSong === lastPlayed?.track?.name) {
            const timeTaken = (Date.now() - startTime) / 1000;
            setScore(Math.max(100 - timeTaken * 10, 0));
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <BentoGrid className="grid-cols-3 md:grid-cols-2 gap-4">
                <BentoGridItem className="col-span-3 p-6 bg-black text-white rounded-lg shadow-md">
                    <motion.h2 className="text-2xl font-bold text-center text-green-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        🎵 Guess the Song
                    </motion.h2>
                    <p className="text-sm text-center mt-2 text-gray-400">
                        Last Played: <span className="font-semibold text-white">{lastPlayed?.track?.name || "None"}</span>
                    </p>
                    {!previewAvailable && <p className="text-xs text-center text-red-500 mt-2">Preview not available for this track.</p>}
                </BentoGridItem>
                </BentoGrid>

                <BentoGrid className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <BentoGridItem className="p-4 bg-gray-900 rounded-lg">
        <button onClick={startGame} className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md w-full">
            ▶ Play Preview
        </button>
    </BentoGridItem>
    
    <BentoGridItem className="p-4 bg-gray-900 rounded-lg">
        <select value={selectedSong} onChange={(e) => setSelectedSong(e.target.value)} className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white">
            <option value="" disabled>Select the song</option>
            {options.length > 0 ? options.map((song) => (
                <option key={song.id} value={song.name}>{song.name}</option>
            )) : <option disabled>No options available</option>}
        </select>
    </BentoGridItem>

    <BentoGridItem className="p-4 bg-gray-900 rounded-lg">
        <button onClick={checkAnswer} className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-md w-full">
            ✅ Submit Answer
        </button>
    </BentoGridItem>

    {score !== null && (
        <BentoGridItem className="col-span-1 md:col-span-3 p-4 bg-gray-800 text-center text-green-400 font-bold text-lg rounded-lg">
            🎯 Your Score: {score.toFixed(2)}
        </BentoGridItem>
    )}
</BentoGrid>

        </div>
    );
};

export default SpotifyGuessSong;
