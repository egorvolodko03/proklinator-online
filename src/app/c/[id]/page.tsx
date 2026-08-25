import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const id = params.id;
  const baseUrl = 'https://proklinator-online.vercel.app';

  // Read params or fallback
  const name = typeof searchParams.name === 'string' ? searchParams.name : 'Гражданин';
  const realm = typeof searchParams.realm === 'string' ? searchParams.realm : 'dark';
  const sin = typeof searchParams.sin === 'string' ? searchParams.sin : 'Нарушение вселенского баланса';
  const curse = typeof searchParams.curse === 'string' ? searchParams.curse : 'Кара Канцелярии';
  const title = typeof searchParams.title === 'string' ? searchParams.title : 'Официальный Приговор';

  const isDark = realm === 'dark';
  const ogImageUrl = `${baseUrl}/api/og?realm=${realm}&name=${encodeURIComponent(name)}&sin=${encodeURIComponent(sin)}&curse=${encodeURIComponent(curse)}&title=${encodeURIComponent(title)}`;

  return {
    title: isDark ? `Грамота Проклятия — ${name}` : `Грамота Благодати — ${name}`,
    description: isDark ? `Приговор Канцелярии: ${curse}` : `Благословение: ${curse}`,
    openGraph: {
      title: isDark ? `⚖️ Грамота Проклятия: ${name}` : `✨ Грамота Благодати: ${name}`,
      description: isDark ? `Деяние: «${sin}»\nПриговор: «${curse}»` : `Добро: «${sin}»\nБлагодать: «${curse}»`,
      url: `${baseUrl}/c/${id}`,
      siteName: 'Проклинатор онлайн',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: isDark ? 'Грамота Проклятия' : 'Грамота Благодати',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isDark ? `⚖️ Грамота Проклятия: ${name}` : `✨ Грамота Благодати: ${name}`,
      description: `«${curse}»`,
      images: [ogImageUrl],
    },
  };
}

export default function CertificatePage({ params, searchParams }: Props) {
  const query = new URLSearchParams();
  query.set('c_id', params.id);
  Object.entries(searchParams).forEach(([k, v]) => {
    if (typeof v === 'string') query.set(k, v);
  });

  // Redirect to main app with preloaded certificate modal
  redirect(`/?${query.toString()}`);
}
