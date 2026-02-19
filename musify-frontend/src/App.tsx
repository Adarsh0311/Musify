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
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Pagination & Search State
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);



  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Reset and fetch when search query changes
      setSongs([]);
      setNextToken(null);
      setHasMore(true);
      fetchSongs(null, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSongs = (token: string | null, query: string) => {
    setLoading(true);

    // Call API with limit, token, and search
    // Using explicit URL construction here, or better use the service we defined.
    // Let's use the service if imported, but for now matching existing pattern in App.tsx
    // actually, let's fix the fetch call to match the backend expectation

    const params = new URLSearchParams();
    params.append('limit', '20');
    if (token) params.append('nextToken', token);
    if (query) params.append('search', query);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/musictrack?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setSongs(prev => {
          // If token is null (first page), replace. Else append.
          if (!token) return data.items;
          // Deduplicate based on s3Key just in case
          const newItems = data.items.filter((item: MusicTrack) => !prev.some(p => p.s3Key === item.s3Key));
          return [...prev, ...newItems];
        });
        setNextToken(data.nextToken);
        setHasMore(!!data.nextToken);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error", err);
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
    if (nextToken) {
      fetchSongs(nextToken, searchQuery);
    }
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
              placeholder="Search or Paste URL"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {songs.map((song) => (
            <SongCard key={song.s3Key} track={song} />
          ))}
        </div>

        <div className="d-flex justify-content-center mt-4 mb-4">
          {loading && <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>}
          {!loading && hasMore && (
            <button className="btn btn-outline-primary rounded-pill px-4" onClick={loadMore}>
              Load More
            </button>
          )}
          {!loading && songs.length === 0 && <p className="text-secondary">No songs found.</p>}
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
