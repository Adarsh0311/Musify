import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MusicTrack } from '../types';

interface PlayerContextType {
    currentTrack: MusicTrack | null;
    currentTrackUrl: string;
    isPlaying: boolean;
    playTrack: (track: MusicTrack) => Promise<void>;
    setIsPlaying: (isPlaying: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [currentTrackUrl, setCurrentTrackUrl] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    async function playTrack(track: MusicTrack) {
        try {
            // In a real scenario, we might want to cache this or handle it more robustly
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/musictrack/stream?key=${track.s3Key}`);

            if (!response.ok) {
                throw new Error('Failed to get presigned URL');
            }

            const presignedUrl = await response.text();

            setCurrentTrackUrl(presignedUrl);
            setCurrentTrack(track);
            setIsPlaying(true);
        } catch (err) {
            console.error("Failed to play track:", err);
        }
    }

    return (
        <PlayerContext.Provider value={{ currentTrack, currentTrackUrl, isPlaying, playTrack, setIsPlaying }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
