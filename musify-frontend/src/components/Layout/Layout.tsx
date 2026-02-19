import type { ReactNode } from 'react';
import { PlayerBar } from '../PlayerBar';
import { Home, Search, Library, PlusSquare, Heart, Music } from 'lucide-react';
import '../../App.css'; // Ensure CSS is imported

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="app-container">
            <div className="main-wrapper">

                {/* Sidebar */}
                <aside className="sidebar d-none d-md-flex">
                    <div className="sidebar-brand">
                        <Music size={32} />
                        <span>Musify</span>
                    </div>

                    <nav className="d-flex flex-column gap-2">
                        <a href="#" className="nav-link">
                            <Home size={24} />
                            Home
                        </a>
                        <a href="#" className="nav-link active">
                            <Search size={24} />
                            Search
                        </a>
                        <a href="#" className="nav-link">
                            <Library size={24} />
                            Your Library
                        </a>
                    </nav>

                    <div className="mt-4 d-flex flex-column gap-2">
                        <a href="#" className="nav-link">
                            <PlusSquare size={24} />
                            Create Playlist
                        </a>
                        <a href="#" className="nav-link">
                            <Heart size={24} color="#a78bfa" />
                            Liked Songs
                        </a>
                    </div>

                    <div className="mt-auto border-top border-secondary pt-4">
                        <p className="small text-secondary">Cookies</p>
                        <p className="small text-secondary mt-2">Privacy</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {children}
                </main>

            </div>

            {/* Player Bar (Fixed Overlay) */}
            <PlayerBar />
        </div>
    );
}
