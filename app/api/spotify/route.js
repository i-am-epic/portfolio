import SpotifyWebApi from 'spotify-web-api-node';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const cookieStore = await cookies();
  const cookieRefreshToken = cookieStore.get('spotify_refresh_token')?.value;
  const cookieAccessToken = cookieStore.get('spotify_access_token')?.value;

  const accessToken =
    cookieAccessToken ||
    process.env.SPOTIFY_ACCESS_TOKEN ||
    process.env.SPOTIFY_USER_ACCESS_TOKEN ||
    process.env.SPOTIFY_BEARER_TOKEN;
  const clientId =
    process.env.SPOTIFY_CLIENT_ID ||
    process.env.SPOTIFY_CLIENTID ||
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET ||
    process.env.SPOTIFY_CLIENTSECRET ||
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const refreshToken =
    cookieRefreshToken ||
    process.env.SPOTIFY_REFRESH_TOKEN ||
    process.env.SPOTIFY_TOKEN_REFRESH ||
    process.env.SPOTIFY_REFRESH;
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    process.env.SPOTIFY_CALLBACK_URL ||
    process.env.NEXTAUTH_URL;

  const missing = [];
  if (!clientId) missing.push('SPOTIFY_CLIENT_ID');
  if (!clientSecret) missing.push('SPOTIFY_CLIENT_SECRET');
  if (!refreshToken && !accessToken) missing.push('SPOTIFY_REFRESH_TOKEN or SPOTIFY_ACCESS_TOKEN');

  const hasSpotifyConfig = missing.length === 0;

  if (!hasSpotifyConfig) {
    return new Response(
      JSON.stringify({
        currentlyPlaying: null,
        lastPlayed: null,
        reason: `Spotify credentials are not fully configured. Missing: ${missing.join(', ')}`,
      }),
      { status: 200 }
    );
  }

  try {
    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
    });

    // Prefer refresh-token flow for durable auth, fallback to short-lived access token.
    if (refreshToken) {
      spotifyApi.setRefreshToken(refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      const freshAccessToken = data.body['access_token'];
      spotifyApi.setAccessToken(freshAccessToken);
    } else {
      spotifyApi.setAccessToken(accessToken);
    }

    // Fetch the currently playing track
    const currentlyPlayingData = await spotifyApi.getMyCurrentPlayingTrack();

    // Optionally, you can also fetch recently played tracks:
    const recentlyPlayedData = await spotifyApi.getMyRecentlyPlayedTracks();

    return new Response(JSON.stringify({
      currentlyPlaying: currentlyPlayingData.body,
      lastPlayed: recentlyPlayedData.body
    }), { status: 200 });
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    const message = (error && typeof error.message === 'string') ? error.message : '';
    const authHint = message.toLowerCase().includes('permissions') || message.toLowerCase().includes('scope')
      ? 'Token does not have required user scopes. Use user-read-currently-playing and user-read-recently-played.'
      : 'Spotify API unavailable';
    return new Response(
      JSON.stringify({
        currentlyPlaying: null,
        lastPlayed: null,
        reason: authHint,
      }),
      { status: 200 }
    );
  }
}
