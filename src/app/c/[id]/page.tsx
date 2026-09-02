import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DecreeVerdict } from '@/types';

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://proklinator-online.vercel.app';
}

async function getVerdict(id: string): Promise<DecreeVerdict | null> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/curses?id=${id}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.verdict) return data.verdict;
    }
  } catch {
    // fallback
  }
  return null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const id = params.id;
  const baseUrl = getBaseUrl();

  const verdict = await getVerdict(id);

  // Read from fetched verdict or searchParams fallback
  const name = verdict?.targetName || (typeof searchParams.name === 'string' ? searchParams.name : 'Гражданин');
  const realm = verdict?.realm || (typeof searchParams.realm === 'string' ? searchParams.realm : 'dark');
  const sin = verdict?.actionText || (typeof searchParams.sin === 'string' ? searchParams.sin : 'Нарушение баланса');
  const curse = verdict?.verdictText || (typeof searchParams.curse === 'string' ? searchParams.curse : 'Кара Канцелярии');
  const title = verdict?.verdictTitle || (typeof searchParams.title === 'string' ? searchParams.title : 'Официальный Приговор');

  const isDark = realm === 'dark';
  const ogImageUrl = `${baseUrl}/api/og?realm=${realm}&name=${encodeURIComponent(name)}&sin=${encodeURIComponent(sin)}&curse=${encodeURIComponent(curse)}&title=${encodeURIComponent(title)}&case=${encodeURIComponent(verdict?.caseNumber || id)}`;

  return {
    title: isDark ? `Грамота Проклятия — ${name}` : `Грамота Благодати — ${name}`,
    description: isDark ? `Приговор: ${curse}` : `Благословение: ${curse}`,
    openGraph: {
      title: isDark ? `⚖️ Грамота Проклятия: ${name}` : `✨ Грамота Благодати: ${name}`,
      description: isDark ? `⚡ Деяние: «${sin}»\n🩸 Приговор: «${curse}»` : `🌟 Добро: «${sin}»\n🕊️ Благодать: «${curse}»`,
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

export default async function CertificatePage({ params, searchParams }: Props) {
  const verdict = await getVerdict(params.id);
  const query = new URLSearchParams();
  query.set('c_id', params.id);

  if (verdict) {
    query.set('name', verdict.targetName);
    query.set('realm', verdict.realm);
    query.set('sin', verdict.actionText);
    query.set('curse', verdict.verdictText);
    query.set('title', verdict.verdictTitle);
    query.set('cat', verdict.category);
  } else {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (typeof v === 'string') query.set(k, v);
    });
  }

  // Redirect to main app with preloaded certificate modal
  redirect(`/?${query.toString()}`);
}
