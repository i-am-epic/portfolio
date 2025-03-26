import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const SPOTIFY_AUTHORIZATION_URL =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
        scope: "user-read-currently-playing user-read-recently-played",
    });

export const authOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization: SPOTIFY_AUTHORIZATION_URL,
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in: store the access token, refresh token, and expiry time.
            if (account) {
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: Date.now() + account.expires_in * 1000, // expires_in is in seconds
                    user: token.user,
                };
            }
            // If the token is still valid, return it.
            if (Date.now() < token.accessTokenExpires) {
                return token;
            }
            // Access token has expired, try to refresh it.
            try {
                const url = "https://accounts.spotify.com/api/token";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                            ).toString("base64"),
                    },
                    body: new URLSearchParams({
                        grant_type: "refresh_token",
                        refresh_token: token.refreshToken,
                    }),
                });
                const refreshedTokens = await response.json();
                if (!response.ok) throw refreshedTokens;
                return {
                    ...token,
                    accessToken: refreshedTokens.access_token,
                    accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
                    // Fall back to old refresh token if no new one is returned
                    refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
                };
            } catch (error) {
                console.error("Error refreshing access token:", error);
                return {
                    ...token,
                    error: "RefreshAccessTokenError",
                };
            }
        },
        async session({ session, token }) {
            session.user = token.user;
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
