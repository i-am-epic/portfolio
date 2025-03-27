import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Set the refresh token you obtained during the OAuth flow
spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);

export async function GET(req) {
  try {
    // Refresh the access token
    const data = await spotifyApi.refreshAccessToken();
    const accessToken = data.body['access_token'];
    spotifyApi.setAccessToken(accessToken);

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
    return new Response(JSON.stringify({ error: 'Failed to fetch Spotify data' }), { status: 500 });
  }
}
