import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Roamly — Discover Hidden Gems with Local Insiders',
  description: 'Connect with verified local guides and discover authentic, off-the-beaten-path experiences. Explore hidden gems through the eyes of those who know them best.',
  keywords: ['travel', 'local guides', 'hidden gems', 'authentic experiences', 'travel community'],
  openGraph: {
    title: 'Roamly — Discover Hidden Gems with Local Insiders',
    description: 'Connect with verified local guides and discover authentic, off-the-beaten-path experiences.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0C0804',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
