import { getAccessToken } from '../auth/[...nextauth]/route';
import axios from 'axios';

export async function GET(req) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Failed to obtain access token' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Fetch Currently Playing Song
        const nowPlayingResponse = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Fetch Recently Played Songs (if nothing is playing)
        const lastPlayedResponse = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return new Response(JSON.stringify({
            currentlyPlaying: nowPlayingResponse.data?.item || null,
            lastPlayed: lastPlayedResponse.data?.items || [],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching Spotify data:', error.response ? error.response.data : error.message);
        return new Response(JSON.stringify({
            error: 'Error fetching song data',
            details: error.response ? error.response.data : error.message,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
