import { useEffect, useState } from 'react'
import './App.css'
import type { MusicTrack } from './types';
import { PlayerProvider } from './context/PlayerContext';
import { Layout } from './components/Layout/Layout';
import { SongCard } from './components/SongCard';
import { UploadModal } from './components/UploadModal';
import { Search, Upload, Music } from 'lucide-react';

function MusifyApp() {
  const [songs, setSongs] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSongs([]);
      setNextToken(null);
      setHasMore(true);
      fetchSongs(null, searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSongs = (token: string | null, query: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('limit', '20');
    if (token) params.append('nextToken', token);
    if (query) params.append('search', query);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/musictrack?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setSongs(prev => {
          if (!token) return data.items;
          const newItems = data.items.filter((item: MusicTrack) => !prev.some(p => p.s3Key === item.s3Key));
          return [...prev, ...newItems];
        });
        setNextToken(data.nextToken);
        setHasMore(!!data.nextToken);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error', err);
        setLoading(false);
      });
  };

  const handleUploadSuccess = () => {
    setSongs([]);
    setNextToken(null);
    setHasMore(true);
    fetchSongs(null, '');
  };

  const loadMore = () => {
    if (nextToken) fetchSongs(nextToken, searchQuery);
  };

  return (
    <Layout>
      {/* ── Sticky Header ── */}
      <header className="app-header">
        {/* Logo / Brand */}
        <a className="header-brand" href="#" aria-label="Musify">
          <Music size={26} color="#1db954" />
          <span>Musify</span>
        </a>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-icon">
            <Search size={18} />
          </div>
          <input
            id="search"
            type="search"
            className="search-input"
            placeholder="Search songs or artists…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button
            id="upload-btn"
            className="btn btn-dark rounded-pill px-3 py-2 d-flex align-items-center gap-2 fw-semibold"
            style={{ fontSize: '14px' }}
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload size={15} />
            <span className="upload-btn-label">Upload Track</span>
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="content-padding">
        <h2 className="section-title">Good evening</h2>

        <div className="song-grid">
          {songs.map((song) => (
            <SongCard key={song.s3Key} track={song} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          {loading && (
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          )}
          {!loading && hasMore && songs.length > 0 && (
            <button
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={loadMore}
            >
              Load More
            </button>
          )}
          {!loading && songs.length === 0 && (
            <p className="text-secondary">No songs found.</p>
          )}
        </div>
      </div>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <PlayerProvider>
      <MusifyApp />
    </PlayerProvider>
  );
}

export default App;
