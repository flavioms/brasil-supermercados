import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { PostHogProvider } from '@/providers/PostHogProvider';
import './globals.css';

export const metadata: Metadata = {
  applicationName: 'Supermercado Brasil',
  title: {
    default: 'Supermercado Brasil — Controle seus gastos no mercado',
    template: '%s | Supermercado Brasil',
  },
  description:
    'Faça sua lista de compras antes de sair de casa, marque cada item ao colocar no carrinho e veja o total em tempo real. Evite surpresas no caixa. App gratuito e offline.',
  keywords: [
    'lista de compras',
    'controle de gastos',
    'supermercado',
    'mercado',
    'atacadão',
    'orçamento familiar',
    'economia doméstica',
    'app mercado offline',
    'controle financeiro',
  ],
  authors: [{ name: 'Supermercado Brasil' }],
  creator: 'Supermercado Brasil',
  category: 'finance',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Supermercado Brasil',
    title: 'Supermercado Brasil — Controle seus gastos no mercado',
    description:
      'Faça sua lista de compras, marque cada item no carrinho e veja o total em tempo real. Sem surpresas no caixa.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Supermercado Brasil',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Supermercado Brasil — Controle seus gastos no mercado',
    description:
      'Faça sua lista de compras, marque cada item no carrinho e veja o total em tempo real.',
    images: ['/icons/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.png',
  },
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
      <body>
        <PostHogProvider>
          <div className="relative mx-auto min-h-dvh w-full max-w-[var(--size-app-max-w)]">
            {children}
          </div>
        </PostHogProvider>
        {process.env.NODE_ENV === 'production' &&
          process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID &&
          !process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID.startsWith('SUBSTITUA') && (
            <Script id="ms-clarity" strategy="afterInteractive">{`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
            `}</Script>
          )}
      </body>
    </html>
  );
}
