import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const realm = searchParams.get('realm') || 'dark';
    const isDark = realm === 'dark';
    const name = searchParams.get('name') || (isDark ? 'Грешник' : 'Благодетель');
    const sin = searchParams.get('sin') || (isDark ? 'Нарушение вселенского баланса' : 'Великодушный поступок');
    const curse = searchParams.get('curse') || (isDark ? 'Кара небесной канцелярии' : 'Вечное кармическое благословение');
    const title = searchParams.get('title') || (isDark ? 'Кармический приговор' : 'Астральное благословение');
    const caseNum = searchParams.get('case') || '№ КРМ-777-Ω';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#09090b',
            backgroundImage: isDark
              ? 'radial-gradient(circle at 50% 10%, rgba(255, 77, 40, 0.25), transparent 60%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.2), transparent 50%)'
              : 'radial-gradient(circle at 50% 10%, rgba(251, 191, 36, 0.3), transparent 60%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.25), transparent 50%)',
            padding: '40px',
            fontFamily: 'sans-serif',
            color: '#f4f4f5',
            border: isDark ? '8px solid #fbbf24' : '8px solid #34d399',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isDark ? '#fbbf24' : '#34d399',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {isDark ? '❖ ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМА-КОНТРОЛЯ ❖' : '✦ НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ ✦'}
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {isDark ? 'ГРАМОТА ПРОКЛЯТИЯ' : 'ГРАМОТА БЛАГОДАТИ'}
            </div>
            <div style={{ fontSize: 14, color: '#a1a1aa', marginTop: 4, fontFamily: 'monospace' }}>
              ДЕЛО {caseNum}
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: isDark ? 'rgba(19, 12, 34, 0.85)' : 'rgba(15, 23, 42, 0.85)',
              border: isDark ? '2px solid rgba(255, 77, 40, 0.5)' : '2px solid rgba(251, 191, 36, 0.5)',
              borderRadius: 20,
              padding: '24px 32px',
            }}
          >
            {/* Subject */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, color: isDark ? '#fbbf24' : '#34d399', fontWeight: 700, marginRight: 10 }}>
                {isDark ? 'СУБЪЕКТ:' : 'АДРЕСАТ:'}
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>
                {name}
              </span>
            </div>

            {/* Reason */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: isDark ? '#ff4d28' : '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                {isDark ? 'Вменяемое деяние (Грех):' : 'Зафиксированный подвиг (Добро):'}
              </span>
              <span style={{ fontSize: 17, fontStyle: 'italic', color: '#e4e4e7', marginTop: 2 }}>
                «{sin}»
              </span>
            </div>

            {/* Verdict */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: isDark ? 'rgba(255, 77, 40, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                border: isDark ? '1px solid rgba(255, 77, 40, 0.4)' : '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: 12,
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isDark ? 'Приговор:' : 'Благословение:'} {title}
                </span>
                <span style={{ fontSize: 12, color: isDark ? '#ff4d28' : '#34d399', fontWeight: 700 }}>
                  [ЗАВЕРЕНО В АСТРАЛЕ]
                </span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                {curse}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: 14,
              color: '#a1a1aa',
              borderTop: '1px solid rgba(251, 191, 36, 0.3)',
              paddingTop: 12,
            }}
          >
            <span style={{ color: isDark ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
              ★ ПЕЧАТЬ КАНЦЕЛЯРИИ АКТИВНА
            </span>
            <span style={{ fontFamily: 'monospace' }}>
              PROKLINATOR.ONLINE
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate the image: ${errorMsg}`, {
      status: 500,
    });
  }
}
