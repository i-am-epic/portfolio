import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BentoGridItem } from "@/components/bento-grid-item";

type SpotifyApiResponse = {
  currentlyPlaying?: SongPayload | null;
  lastPlayed?: {
    items?: Array<{
      track?: SongPayload["item"];
    }>;
  } | null;
  reason?: string;
};

type SongPayload = {
  item?: {
    name?: string;
    album?: { images?: Array<{ url: string }> };
    artists?: Array<{ name: string }>;
    external_urls?: { spotify?: string };
  };
};

const CurrentlyPlayingCard = () => {
  const [currentSong, setCurrentSong] = useState<SongPayload | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [statusReason, setStatusReason] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongData = async () => {
      setHasError(false);
      setStatusReason(null);
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) {
          throw new Error("Could not fetch Spotify status");
        }

        const data = (await res.json()) as SpotifyApiResponse;
        // Check for a currently playing song first
        if (data.currentlyPlaying && data.currentlyPlaying.item) {
          setCurrentSong(data.currentlyPlaying);
          setIsPlaying(true);
        } else if (
          data.lastPlayed &&
          data.lastPlayed.items &&
          data.lastPlayed.items.length > 0
        ) {
          // Use the first recently played track as fallback
          setCurrentSong({ item: data.lastPlayed.items[0].track });
          setIsPlaying(false);
        } else {
          setCurrentSong(null);
          setStatusReason(data.reason || "Nothing recent on Spotify right now.");
        }
      } catch (error) {
        console.error("Error fetching song data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
    const interval = window.setInterval(fetchSongData, 45000);
    return () => window.clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <BentoGridItem className="p-4">
        <div className="h-full animate-pulse rounded-3xl bg-card-hover p-5">
          <div className="mb-3 h-4 w-36 rounded bg-muted/50" />
          <div className="h-[190px] rounded-2xl bg-muted/40" />
        </div>
      </BentoGridItem>
    );
  }

  if (hasError) {
    return (
      <BentoGridItem className="p-4">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">Could not load Spotify right now.</p>
        </div>
      </BentoGridItem>
    );
  }

  if (!currentSong) {
    const isConfigIssue = Boolean(
      statusReason && statusReason.toLowerCase().includes("spotify credentials are not fully configured")
    );
    const isMissingUserToken = Boolean(
      statusReason && statusReason.toLowerCase().includes("refresh_token or spotify_access_token")
    );

    return (
      <BentoGridItem className="p-4">
        <div className="flex h-full flex-col justify-center rounded-3xl border border-dashed border-border bg-card-hover/50 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Spotify status</p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {isConfigIssue
              ? "Spotify is not wired yet."
              : "No live track right now."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isConfigIssue
              ? "Add the missing Spotify variables in .env.local and this card will show now playing or recent tracks."
              : statusReason || "Once you play something, this card will show the latest track."}
          </p>
          {isMissingUserToken ? (
            <a
              href="/api/spotify/login"
              className="mt-4 inline-flex self-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground transition hover:bg-card-hover"
            >
              Connect Spotify Account
            </a>
          ) : null}
        </div>
      </BentoGridItem>
    );
  }

  // Get the album image (largest available)
  const albumImage = currentSong.item?.album?.images?.[0]?.url || "/placeholder.svg";
  // Get the track's Spotify URL
  const trackUrl = currentSong.item?.external_urls?.spotify;
  const artistName = currentSong.item?.artists?.[0]?.name;

  return (
    <BentoGridItem className="p-4">
      <p className="mb-2 text-xs text-muted-foreground">{isPlaying ? "Now playing" : "Recently played"}</p>
      <motion.a
        href={trackUrl || "https://spotify.com"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block rounded-3xl overflow-hidden"
        whileHover={{ scale: 1.05 }}
      >
        <Image
          src={albumImage}
          alt={currentSong.item?.name || "Song"}
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
          className="absolute inset-0 flex items-center justify-center  opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <Image src="/spotify_logo.png" alt="Spotify" width={200} height={200} />
        </motion.div>
      </motion.a>
      <div className="mt-3">
        <p className="line-clamp-1 text-sm font-medium">{currentSong.item?.name}</p>
        <p className="text-xs text-muted-foreground">{artistName || "Unknown artist"}</p>
      </div>
    </BentoGridItem>
  );
};

export default CurrentlyPlayingCard;
