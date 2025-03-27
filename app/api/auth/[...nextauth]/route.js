import querystring from 'querystring';
import { NextResponse } from "next/server";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    };
    const body = querystring.stringify({ grant_type: 'client_credentials' });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: headers,
            body: body,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error_description || 'Failed to obtain access token');
        }
        console.log('Access token obtained:', data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('Error obtaining access token:', error);
        return null;
    }
}

export { getAccessToken };
