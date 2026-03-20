import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const origin = new URL(request.url).origin;
    const inferredOrigin = origin.includes('localhost:3002')
        ? 'https://localhost:3002'
        : origin;
    const appBase = process.env.NEXTAUTH_URL || inferredOrigin;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri =
        process.env.SPOTIFY_REDIRECT_URI ||
        `${appBase}/callback`;

    if (!code || !clientId || !clientSecret) {
        return NextResponse.redirect(new URL('/?spotify=callback-missing-data', appBase));
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
        return NextResponse.redirect(new URL('/?spotify=token-exchange-failed', appBase));
    }

    const response = NextResponse.redirect(new URL('/?spotify=connected', appBase));

    if (tokenData.refresh_token) {
        response.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 180,
        });
    }

    if (tokenData.access_token) {
        response.cookies.set('spotify_access_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 55,
        });
    }

    return response;
}
