import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';
import { unlink } from 'fs/promises';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const style = formData.get('style');

        if (!file || !style) {
            return NextResponse.json({ error: 'File and style are required' }, { status: 400 });
        }

        // Convert the uploaded file to a buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use sharp to convert the image to PNG, ensure an alpha channel, and resize to a square (e.g., 512x512)
        const tempFilePath = path.join('/tmp', `${Date.now()}_${file.name.split('.')[0]}.png`);
        await sharp(buffer)
            .resize(512, 512, { fit: 'cover' })
            .ensureAlpha() // Ensure the image has an alpha channel (RGBA)
            .png()
            .toFile(tempFilePath);

        // Call OpenAI API for image editing
        const response = await openai.images.createVariation({
            image: fs.createReadStream(tempFilePath),
            options: 'style-transfer',
            prompt: `Transform this image into the style of ${style}.`,
        });
        console.log('OpenAI response:', response);
        // Remove the temporary file
        await unlink(tempFilePath);

        if (!response.data || response.data.length === 0) {
            throw new Error('Failed to generate image');
        }

        return NextResponse.json({ image: response.data[0].url }, { status: 200 });
    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
}
