import { NextResponse } from 'next/server';

const DOMAIN_SOURCE_MAP = [
  { pattern: /instagram\.com/i, source: 'Instagram', fallbackTitle: 'Instagram 게시물' },
  { pattern: /youtube\.com|youtu\.be/i, source: 'YouTube', fallbackTitle: 'YouTube 영상' },
  { pattern: /(^|\.)x\.com|twitter\.com/i, source: 'X', fallbackTitle: 'X 게시물' },
  { pattern: /pinterest\.com|pin\.it/i, source: 'Pinterest', fallbackTitle: 'Pinterest 핀' },
  { pattern: /tiktok\.com/i, source: 'TikTok', fallbackTitle: 'TikTok 영상' },
  { pattern: /threads\.net|threads\.com/i, source: 'Threads', fallbackTitle: 'Threads 게시물' },
];

function detectSource(hostname) {
  for (const entry of DOMAIN_SOURCE_MAP) {
    if (entry.pattern.test(hostname)) {
      return { source: entry.source, fallbackTitle: entry.fallbackTitle };
    }
  }
  return { source: 'Other', fallbackTitle: null };
}

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractMeta(html) {
  const get = (name) => {
    const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    if (match) return match[1];
    const reversed = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i');
    const match2 = html.match(reversed);
    return match2 ? match2[1] : null;
  };

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);

  return {
    ogTitle: decodeHtmlEntities(get('og:title') || get('twitter:title') || (titleTag ? titleTag[1].trim() : null)),
    ogImage: decodeHtmlEntities(get('og:image') || get('twitter:image') || null),
    ogDescription: decodeHtmlEntities(get('og:description') || get('description') || null),
  };
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 });
    }

    const { source, fallbackTitle } = detectSource(parsedUrl.hostname);

    let title = fallbackTitle;
    let thumbnailUrl = null;
    let description = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SaveBox/1.0; +https://savebox.app)',
          'Accept': 'text/html',
        },
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const html = await response.text();
          const meta = extractMeta(html);
          if (meta.ogTitle) title = meta.ogTitle;
          if (meta.ogImage) thumbnailUrl = meta.ogImage;
          if (meta.ogDescription) description = meta.ogDescription;
        }
      }
    } catch {
      // fetch 실패해도 도메인 기반 정보는 반환
    }

    // 상대경로 이미지를 절대 URL로 변환
    if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
      try {
        thumbnailUrl = new URL(thumbnailUrl, parsedUrl.origin).href;
      } catch {
        thumbnailUrl = null;
      }
    }

    return NextResponse.json({
      title: title || parsedUrl.hostname,
      source,
      thumbnailUrl,
      description,
      url: parsedUrl.href,
    });
  } catch {
    return NextResponse.json({ error: '메타데이터를 가져올 수 없습니다.' }, { status: 500 });
  }
}
