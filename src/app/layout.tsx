import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { SWRProvider } from '@/components/providers/SWRProvider';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Roamly — Discover Hidden Gems with Local Insiders',
  description: 'Connect with verified local guides and discover authentic, off-the-beaten-path experiences. Explore hidden gems through the eyes of those who know them best.',
  keywords: ['travel', 'local guides', 'hidden gems', 'authentic experiences', 'travel community'],
  icons: {
    icon: '/assets/logos/non-transparent/07_icon_orange_bg.png',
    apple: '/assets/logos/non-transparent/07_icon_orange_bg.png',
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('roamly-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <SWRProvider>
            <AppShell>{children}</AppShell>
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
