'use client';

import { useState } from 'react';

export default function AigenUI() {
    const [file, setFile] = useState(null);
    const [style, setStyle] = useState('ghibli');
    const [resultImage, setResultImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('style', style);

        setLoading(true);

        try {
            const res = await fetch('/api/aigenstudio', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await res.json();
            setResultImage(data.image);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Aigen Studio</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="file">Upload Image:</label>
                    <input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
                <div>
                    <label htmlFor="style">Select Style:</label>
                    <select
                        id="style"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        <option value="ghibli">Ghibli</option>
                        <option value="rick and morty">Rick and Morty</option>
                        <option value="minecraft">Minecraft</option>
                        {/* Add additional styles as needed */}
                    </select>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Image'}
                </button>
            </form>
            {resultImage && (
                <div style={{ marginTop: '2rem' }}>
                    <h2>Generated Image:</h2>
                    <img src={resultImage} alt="Generated" style={{ maxWidth: '100%' }} />
                </div>
            )}
        </div>
    );
}
