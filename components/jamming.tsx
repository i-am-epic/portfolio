import { useState, useEffect } from "react";

// A simple component to display the currently playing (or last played) track info.
const CurrentlyJamming = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchCurrentlyPlaying = async () => {
      try {
        const res = await fetch("/api/spotify");
        const data = await res.json();
        // Check if there is a currently playing track
        if (data.currentlyPlaying && data.currentlyPlaying.item) {
          setCurrentSong(data.currentlyPlaying.item);
          setIsPlaying(true);
        } else if (data.lastPlayed && data.lastPlayed.items?.length > 0) {
          // Fallback: use the first track from the recently played list
          setCurrentSong(data.lastPlayed.items[0].track);
          setIsPlaying(false);
        } else {
          setCurrentSong(null);
        }
      } catch (error) {
        console.error("Error fetching song data:", error);
      }
    };

    fetchCurrentlyPlaying();
  }, []);

  if (!currentSong) {
    return (
      <div className="text-center text-gray-400">
        Nikhil is not listening to anything currently.
      </div>
    );
  }

  // Get the album image (largest available)
  const albumImage = currentSong.album?.images?.[0]?.url;
  // Get the track's Spotify URL
  const trackUrl = currentSong.external_urls?.spotify;
  const jamURL = process.env.NEXT_PUBLIC_SPOTIFYJAM_URL
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-green-500">
        {isPlaying ? "I'm currently jamming to" : "I was jamming to"}
      </h2>
      <p className="text-xl mt-2">"{currentSong.name}"</p>
      <a
        href={jamURL || "https://spotify.link/FdgaVwTp3Rb" }
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
