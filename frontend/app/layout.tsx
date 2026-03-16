import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Shell } from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'AdBid Intelligence',
  description: 'Production-grade ad bidding intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="h-full font-sans overflow-hidden bg-page text-tp">
        {/* Viewport too small */}
        <div className="viewport-warning">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Larger screen required</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            AdBid Intelligence requires a minimum width of 1280px.<br />
            Please use a desktop browser.
          </p>
        </div>

        {/* Main app */}
        <div className="viewport-main h-full">
          <Shell>{children}</Shell>
        </div>
      </body>
    </html>
  );
}
