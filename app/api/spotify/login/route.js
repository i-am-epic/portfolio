import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const origin = new URL(request.url).origin;
    const inferredOrigin = origin.includes('localhost:3002')
        ? 'https://localhost:3002'
        : origin;
    const appBase = process.env.NEXTAUTH_URL || inferredOrigin;
    const redirectUri =
        process.env.SPOTIFY_REDIRECT_URI ||
        `${appBase}/callback`;

    if (!clientId) {
        return NextResponse.redirect(new URL('/?spotify=missing-client-id', appBase));
    }

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: 'user-read-currently-playing user-read-recently-played user-modify-playback-state user-follow-modify',
        redirect_uri: redirectUri,
        show_dialog: 'true',
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
