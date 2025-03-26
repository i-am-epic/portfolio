import { useState, useEffect } from "react";

// A simple component to display the currently playing (or last played) track info.
const CurrentlyJamming = () => {
    const [currentSong, setCurrentSong] = useState(null);

    useEffect(() => {
        const fetchCurrentlyPlaying = async () => {
            try {
                const res = await fetch("/api/spotify");
                const data = await res.json();
                // Prefer currentlyPlaying if available, else fallback to lastPlayed[0]
                setCurrentSong(data.currentlyPlaying || data.lastPlayed?.[0]?.track || null);
            } catch (error) {
                console.error("Error fetching song data:", error);
            }
        };

        fetchCurrentlyPlaying();
    }, []);

    if (!currentSong) return <div className="text-center text-gray-400">No song playing</div>;

    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-green-500">I'm currently jamming to</h2>
            <p className="text-xl mt-2">"{currentSong.name}"</p>
            <a
                href="https://spotify.link/FdgaVwTp3Rb"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded transition"
            >
                Listen with me
            </a>
        </div>
    );
};


export default CurrentlyJamming;
