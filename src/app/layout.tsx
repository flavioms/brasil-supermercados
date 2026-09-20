import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Supermercado Brasil',
  description: 'Controle seus gastos no supermercado em tempo real',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mercado',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-visual',
  themeColor: '#2e7d32',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <div className="relative mx-auto min-h-dvh w-full max-w-[var(--size-app-max-w)]">
          {children}
        </div>
      </body>
    </html>
  );
}
