import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const accentFont = localFont({
  src: '../fonts/cormorant_unicase.ttf',
  variable: '--font-preciosa',
  display: 'swap',
});

const freeride = localFont({
  src: '../fonts/freeride.otf',
  variable: '--font-freeride',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://proklinator-online.vercel.app'),
  title: 'Проклинатор онлайн — Темная Канцелярия Космической Кармы',
  description:
    'Одно действие — и вы счастливы. Направьте безжалостную космическую бюрократию и абсурдные микро-кары на обидчика.',
  keywords: [
    'проклинатор',
    'проклинатор онлайн',
    'шуточный сайт',
    'кармический суд',
    'генератор проклятий',
    'темная канцелярия',
    'юмор',
    'грамота проклятия',
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
    <html lang="ru" className={`dark scroll-smooth ${accentFont.variable} ${freeride.variable}`}>
      <body className="min-h-screen bg-void-950 text-neutral-100 antialiased selection:bg-inferno-500 selection:text-white bg-noise font-sans">
        {children}
      </body>
    </html>
  );
}
