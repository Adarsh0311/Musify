import { useEffect, useState, useRef, useCallback } from 'react'
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

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSongElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setNextToken((prevToken) => prevToken); // Trigger re-fetch logic if needed, or call fetch directly
        fetchSongs(nextToken, searchQuery);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, nextToken, searchQuery]);

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
    // Note: In strict mode, double invocation might cause duplicate appends if not careful.
    // For production, we'd use a dedicated library like TanStack Query.

    // Check if we are already loading to prevent race conditions (simple check)
    // Actually, `loading` state updates are async, so we might need a ref or better logic.
    // simpler: rely on `useEffect` deps or manual calls.

    fetch(`http://localhost:8080/api/musictrack?limit=20${token ? `&nextToken=${token}` : ''}${query ? `&search=${encodeURIComponent(query)}` : ''}`)
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
          {songs.map((song, index) => {
            if (songs.length === index + 1) {
              return <div ref={lastSongElementRef} key={song.s3Key}><SongCard track={song} /></div>
            } else {
              return <SongCard key={song.s3Key} track={song} />
            }
          })}

          {loading && <p className="text-secondary">Loading...</p>}
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
