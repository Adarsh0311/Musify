import { useEffect, useState } from 'react'
import './App.css'
import type { MusicTrack } from './types';
import { PlayerProvider } from './context/PlayerContext';
import { Layout } from './components/Layout/Layout';
import { SongCard } from './components/SongCard';
import { UploadModal } from './components/UploadModal';
import { Search, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

function MusifyApp() {
  const [songs, setSongs] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchSongs = () => {
    setLoading(true);
    fetch('http://localhost:8080/api/musictrack')
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Java API is down!", err);
        setLoading(false);
      });
  };

  // Fetch data from Spring Boot
  useEffect(() => {
    fetchSongs();
  }, []);

  const handleUploadSuccess = () => {
    fetchSongs();
  };

  return (
    <Layout>
      {/* Header (Inside Main Content) */}
      <header className="app-header">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex gap-2">
            <button className="icon-btn bg-black opacity-50 rounded-circle p-1" disabled>
              <ChevronLeft size={24} />
            </button>
            <button className="icon-btn bg-black opacity-50 rounded-circle p-1" disabled>
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Search Bar - Responsive */}
          <div className="search-container d-none d-md-block">
            <div className="search-icon">
              <Search size={20} />
            </div>
            <input
              type="search"
              className="search-input"
              placeholder="What do you want to play?"
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-2"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload size={16} color="black" />
            <span className="small text-black">Upload Track</span>
          </button>
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            A
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="content-padding mt-4">
        <h2 className="section-title">Good evening</h2>

        {/* Grid Layout */}
        <div className="song-grid">
          {loading ? (
            <p className="text-secondary">Loading your music...</p>
          ) : (
            songs.map(song => (
              <SongCard key={song.s3Key} track={song} />
            ))
          )}
        </div>
      </div>

      {
        isUploadModalOpen && (
          <UploadModal
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )
      }
    </Layout >
  );
}

function App() {
  return (
    <PlayerProvider>
      <MusifyApp />
    </PlayerProvider>
  )
}

export default App
