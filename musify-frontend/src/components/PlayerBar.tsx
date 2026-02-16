import { useRef, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
// import '../App.css'; 

export function PlayerBar() {
    const { currentTrack, currentTrackUrl, isPlaying, setIsPlaying } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Helper to format s -> mm:ss
    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Handle playing state changes from Context
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error("Play error:", err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrackUrl]); // Re-run when url changes/playing state changes

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    if (!currentTrack) return null;

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <footer className="player-bar">

            {/* 1. Track Info */}
            <div className="track-info">
                <div className="track-art-small">
                    <span className=" opacity-50">♫</span>
                </div>
                <div className="d-flex flex-column song-info">
                    <span className=" fw-bold small">
                        {currentTrack.songName}
                    </span>
                    <span className=" x-small">
                        {currentTrack.artistName}
                    </span>
                </div>
            </div>

            {/* 2. Player Controls */}
            <div className="player-controls">
                <div className="control-buttons">
                    <button className="icon-btn">
                        <SkipBack size={20} />
                    </button>

                    <button
                        className="play-pause-btn"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
                    </button>

                    <button className="icon-btn">
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <span>{formatTime(currentTime)}</span>
                    <div
                        className="progress-bar"
                        onClick={handleSeek}
                        style={{ cursor: 'pointer' }}
                    >
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>

                <audio
                    ref={audioRef}
                    src={currentTrackUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="d-none"
                />
            </div>

            {/* 3. Volume / Extra Controls */}
            {/* <div className="volume-controls">
                <Volume2 size={20} className="text-secondary" />
                <div className="progress-bar" style={{ width: '100px' }}>
                    <div className="progress-fill" style={{ width: '50%' }}></div>
                </div>
            </div> */}

        </footer>
    );
}
