import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Local Discovery Agent | Find Places by Desired Experience',
  description: 'Describe the experience you want in natural language. Our AI agent discovers, verifies, and ranks the best real-world places for you.',
  keywords: ['local discovery', 'AI agent', 'travel', 'places', 'weekend getaway', 'activities'],
  authors: [{ name: 'Nikita Dmitrenco' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b0d10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
