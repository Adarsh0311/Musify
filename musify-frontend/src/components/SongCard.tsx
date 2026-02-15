import type { MusicTrack } from '../types';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import '../App.css';

interface SongCardProps {
    track: MusicTrack;
}

export function SongCard({ track }: SongCardProps) {
    const { playTrack } = usePlayer();

    return (
        <div
            className="song-card"
            onClick={() => playTrack(track)}
        >
            <div className="art-placeholder">
                {/* Placeholder for Album Art */}
                <span className="opacity-25 fs-1">♫</span>

                {/* Play Button Overlay */}
                <div className="play-overlay-btn">
                    <Play fill="black" className="text-black" style={{ marginLeft: '4px' }} />
                </div>
            </div>

            <div className="d-flex flex-column gap-1">
                <h3 className="song-title fs-6">
                    {track.songName}
                </h3>
                <p className="artist-name">
                    {track.artistName}
                </p>
            </div>
        </div>
    );
}
