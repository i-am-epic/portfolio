import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BentoGridItem } from "@/components/bento-grid-item";

const CurrentlyPlayingCard = () => {
    const [currentSong, setCurrentSong] = useState(null);

    useEffect(() => {
        fetchCurrentlyPlaying();
    }, []);

    const fetchCurrentlyPlaying = async () => {
        try {
            const res = await fetch("/api/spotify");
            const data = await res.json();
            // Use currentlyPlaying field from the API response
            setCurrentSong(data.currentlyPlaying);
        } catch (error) {
            console.error("Error fetching currently playing song:", error);
        }
    };

    if (!currentSong) {
        return (
            <BentoGridItem className="p-4">
                <div className="text-center text-gray-400">No song playing</div>
            </BentoGridItem>
        );
    }

    // Get the album image (largest available)
    const albumImage = currentSong.album?.images?.[0]?.url;
    // Get the track's Spotify URL
    const trackUrl = currentSong.external_urls?.spotify;

    return (
        <BentoGridItem className="p-4">
            <motion.a
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block rounded-3xl overflow-hidden"
                whileHover={{ scale: 1.05 }} // slight scale on hover
            >
                <Image
                    src={albumImage}
                    alt={currentSong.name}
                    width={600}
                    height={600}
                    className="object-cover"
                />
                {/* Overlay with Spotify logo appears on hover */}
                <motion.div
                    whileHover={{
                        rotate: [0, 360],
                        transition: { duration: 5, ease: "linear", repeat: Infinity }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/025 opacity-0  hover:opacity-100 transition-opacity duration-300"
                >
                    <Image
                        src="/spotify_logo.png"
                        alt="Spotify"
                        width={200}
                        height={200}

                    />
                </motion.div>
            </motion.a>
        </BentoGridItem>
    );
};

export default CurrentlyPlayingCard;
