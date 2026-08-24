import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const preciosa = localFont({
  src: '../fonts/preciosa.ttf',
  variable: '--font-preciosa',
  display: 'swap',
});

const freeride = localFont({
  src: '../fonts/freeride.otf',
  variable: '--font-freeride',
  display: 'swap',
});

export const metadata: Metadata = {
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Проклинатор онлайн',
    description: 'Направьте космическую бюрократию на обидчика.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`dark scroll-smooth ${preciosa.variable} ${freeride.variable}`}>
      <body className="min-h-screen bg-void-950 text-neutral-100 antialiased selection:bg-inferno-500 selection:text-white bg-noise font-sans">
        {children}
      </body>
    </html>
  );
}
