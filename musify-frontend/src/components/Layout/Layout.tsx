import type { ReactNode } from 'react';
import { PlayerBar } from '../PlayerBar';
import '../../App.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="app-container">
            <main className="main-content">
                {children}
            </main>
            <PlayerBar />
        </div>
    );
}
