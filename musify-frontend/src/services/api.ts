import type { MusicTrack } from "../types";

const API_BASE_URL = 'http://localhost:8080/api/musictrack';

interface UploadUrlResponse {
    s3Key: string;
    uploadUrl: string;
}

export const getUploadUrl = async (artistName: string, songName: string): Promise<UploadUrlResponse> => {
    const response = await fetch(`${API_BASE_URL}/upload-url?artistName=${encodeURIComponent(artistName)}&songName=${encodeURIComponent(songName)}`);
    if (!response.ok) {
        throw new Error('Failed to get upload URL');
    }
    return response.json();
};

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
    });
    if (!response.ok) {
        throw new Error('Failed to upload file to S3');
    }
};

export const saveMetadata = async (metadata: MusicTrack): Promise<MusicTrack> => {
    const response = await fetch(`${API_BASE_URL}/metadata`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
    });
    if (!response.ok) {
        throw new Error('Failed to save metadata');
    }
    return response.json();
};
