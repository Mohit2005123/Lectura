import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs'; // ensure Node runtime

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const images = body?.images;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    // if (images.length > 5) {
    //   return NextResponse.json({ error: 'Max 5 images allowed' }, { status: 400 });
    // }

    // Note: previously rejected base64 payloads > 4MB with 413.
    // We now allow larger payloads and rely on upstream/platform limits.

    // Process images in batches of up to 5
    const chunkSize = 5;
    const allSections = [];
    for (let start = 0; start < images.length; start += chunkSize) {
      const chunk = images.slice(start, start + chunkSize);
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                'Extract clean text from these images (handwritten or typed).',
                'Then group content into 5–12 concise sections.',
                'Return ONLY JSON of the form: [{"heading":"...","content":"..."}].',
                'The "content" MUST BE PLAIN TEXT ONLY (no HTML or Markdown).',
                'No prose outside the JSON.'
              ].join(' ')
            },
            ...chunk.map((url) => ({ type: 'image_url', image_url: { url } }))
          ]
        }
      ];

      try {
        const completion = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages,
          response_format: { type: 'text' },
          max_completion_tokens: 5000
        });

        const raw = completion.choices?.[0]?.message?.content ?? '';

        let notes;
        try {
          const parsed = JSON.parse(raw);
          let candidate = Array.isArray(parsed) ? parsed : parsed.notes ?? parsed.sections ?? parsed.data ?? parsed.result ?? parsed;
          if (!Array.isArray(candidate) && typeof candidate === 'object' && Array.isArray(candidate.sections)) {
            candidate = candidate.sections;
          }
          notes = candidate;
        } catch (e) {
          const match = String(raw).match(/\[[\s\S]*\]/);
          if (match) {
            try { notes = JSON.parse(match[0]); } catch (_) { /* ignore */ }
          }
          if (!Array.isArray(notes)) {
            notes = [{ heading: 'Extracted Notes', content: stripHtml(raw) }];
          }
        }

        const normalizedChunk = Array.isArray(notes)
          ? notes.map((n, i) => ({
              heading: typeof n?.heading === 'string' && n.heading.trim() ? n.heading.trim() : `Section ${allSections.length + i + 1}`,
              content: toPlainText(n?.content ?? n)
            }))
          : [{ heading: 'Extracted Notes', content: toPlainText(notes) }];

        allSections.push(...normalizedChunk);
      } catch (batchErr) {
        console.warn('Batch OCR failed, continuing with next batch:', batchErr);
      }
    }

    // If nothing produced, fail early
    const normalized = allSections.length > 0 ? allSections : [{ heading: 'Extracted Notes', content: '' }];

    // Refinement step: expand and enrich notes with an open-source Groq model
    let refined = normalized;
    try {
      const refineSystem = [
        'You are an expert note-writer and explainer.',
        'Refine and EXPAND the provided notes for clarity and completeness.',
        'Add missing background, definitions, key concepts, examples, analogies, and use-cases.',
        'Keep language clear, neutral, and third-person (no references to speaker or video).',
        'Keep 20-30 sections. You may improve headings.',
        'Output STRICT JSON array only: [{"heading":"...","content":"..."}] with plain text in content (no HTML/Markdown).',
      ].join(' ');

      const refineUser = `Refine and expand these notes. Keep the same schema and return ONLY a JSON array.\n\nNotes JSON:\n${JSON.stringify(normalized)}`;

      const refineCompletion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: refineSystem },
          { role: 'user', content: refineUser }
        ],
        response_format: { type: 'text' },
        max_completion_tokens: 4096
      });

      const refineRaw = refineCompletion.choices?.[0]?.message?.content ?? '';
      let refinedParsed;
      try {
        refinedParsed = JSON.parse(refineRaw);
      } catch (_) {
        const m = String(refineRaw).match(/\[[\s\S]*\]/);
        if (m) {
          try { refinedParsed = JSON.parse(m[0]); } catch { /* ignore */ }
        }
      }

      if (Array.isArray(refinedParsed)) {
        refined = refinedParsed.map((n, i) => ({
          heading: typeof n?.heading === 'string' && n.heading.trim() ? n.heading.trim() : `Section ${i + 1}`,
          content: toPlainText(n?.content ?? n)
        }));
      }
    } catch (e) {
      // If refinement fails, fall back silently to normalized
      console.warn('Refinement step failed:', e);
    }

    // Return a plain array like the YouTube flow
    return NextResponse.json(refined);
  } catch (err) {
    console.error('OCR error:', err);
    return NextResponse.json({ error: 'Failed to process notes' }, { status: 500 });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Convert any model output shape to plain text (no HTML) to match video-result expectations
function toPlainText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return stripHtml(value);
  if (Array.isArray(value)) return value.map((v) => toPlainText(v)).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    if (Array.isArray(value.bullets)) return toPlainText(value.bullets);
    if (Array.isArray(value.points)) return toPlainText(value.points);
    if (typeof value.text === 'string') return stripHtml(value.text);
    try { return stripHtml(JSON.stringify(value)); } catch { return '' }
  }
  return String(value);
}

function stripHtml(htmlLike) {
  // 1) Decode common entities first
  const decoded = String(htmlLike)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  // 2) Normalize some block-level tags to newlines or list markers, then strip the rest
  const withoutTags = decoded
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li\s*>/gi, '- ')
    .replace(/<\/(p|div|li|ul|ol|h\d)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '') // remove any stray angle brackets
    .replace(/\r\n/g, '\n');

  // 3) Collapse excessive whitespace/newlines
  return withoutTags
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t\x0B\f\r ]{2,}/g, ' ')
    .trim();
}
