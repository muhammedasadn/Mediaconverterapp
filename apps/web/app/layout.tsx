import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Universal Media Converter — Fast, Private Video & Audio Tools',
  description:
    'Free, ultra-fast, privacy-conscious converter and editor for video and audio. Converted directly on your device with high-speed cloud fallback.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0b0d12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body className="antialiased bg-noise relative pb-20 md:pb-0">
        {/* Ambient Top Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
        {children}
      </body>
    </html>
  );
}
