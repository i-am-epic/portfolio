import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import axios from "axios";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { accessToken } = session;

    try {
        // Fetch Currently Playing Song
        const nowPlaying = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Fetch Recently Played Songs (if nothing is playing)
        const lastPlayed = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=5", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return new Response(JSON.stringify({
            currentlyPlaying: nowPlaying.data?.item || null,
            lastPlayed: lastPlayed.data?.items || [],
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        // Log error details for debugging
        console.error("Error fetching Spotify data:", error.response ? error.response.data : error.message);
        return new Response(JSON.stringify({
            error: "Error fetching song data",
            details: error.response ? error.response.data : error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
