import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://proklinator-online.vercel.app'),
  title: 'Проклинатор онлайн — Темная Канцелярия Космической Кармы',
  description:
    'Одно действие — и вы счастливы. Направьте безжалостную космическую бюрократию и шуточные микро-кары на обидчика.',
  keywords: [
    'проклинатор',
    'проклинатор онлайн',
    'шуточный сайт',
    'кармический суд',
    'генератор проклятий',
    'темная канцелярия',
    'юмор',
    'грамота проклятия',
    'благословитель',
  ],
  authors: [{ name: 'Темная Канцелярия Карма-Контроля' }],
  openGraph: {
    title: 'Проклинатор онлайн — Темная Канцелярия Кармы',
    description:
      'Одно действие — и вы счастливы. Направьте космическую бюрократию на обидчика.',
    type: 'website',
    locale: 'ru_RU',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Грамота Темной Канцелярии Кармы',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Проклинатор онлайн',
    description: 'Направьте космическую бюрократию на обидчика.',
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark scroll-smooth">
      <head>
        {/* Official Telegram Mini App SDK */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-void-950 text-neutral-100 antialiased selection:bg-inferno-500 selection:text-white bg-noise font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
