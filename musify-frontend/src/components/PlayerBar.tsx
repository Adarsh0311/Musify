import { useRef, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export function PlayerBar() {
    const { currentTrack, currentTrackUrl, isPlaying, setIsPlaying } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error('Play error:', err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrackUrl]);

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percentage * duration;
        setCurrentTime(audioRef.current.currentTime);
    };

    if (!currentTrack) return null;

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <footer className="player-bar">
            {/* Track Info */}
            <div className="track-info">
                <div className="track-art-small">
                    <span className="opacity-50">♫</span>
                </div>
                <div className="d-flex flex-column song-info">
                    <span className="fw-bold small">{currentTrack.songName}</span>
                    <span className="x-small" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {currentTrack.artistName}
                    </span>
                </div>
            </div>

            {/* Player Controls */}
            <div className="player-controls">
                <div className="control-buttons">
                    <button className="icon-btn"><SkipBack size={20} /></button>
                    <button className="play-pause-btn" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />}
                    </button>
                    <button className="icon-btn"><SkipForward size={20} /></button>
                </div>

                <div className="progress-container">
                    <span>{formatTime(currentTime)}</span>
                    <div className="progress-bar" onClick={handleSeek} style={{ cursor: 'pointer' }}>
                        <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={currentTrackUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
        </footer>
    );
}
