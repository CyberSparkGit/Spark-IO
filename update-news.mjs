#!/usr/bin/env node

// update-news.mjs — AI news updater powered by Exa search + Claude summaries
//
// Required env vars:
//   EXA_API_KEY       — from exa.ai
//   ANTHROPIC_API_KEY — from console.anthropic.com

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_FILE = join(__dirname, 'news.json');

const EXA_API_KEY = process.env.EXA_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!EXA_API_KEY) { console.error('Missing EXA_API_KEY'); process.exit(1); }
if (!ANTHROPIC_API_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Search Exa and return results with full text included
async function exaSearch(query, numResults = 6) {
  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': EXA_API_KEY },
    body: JSON.stringify({
      query,
      numResults,
      type: 'neural',
      useAutoprompt: true,
      startPublishedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      contents: { text: { maxCharacters: 4000 } },
    }),
  });
  const data = await res.json();
  if (!data.results) {
    console.error('Exa error:', JSON.stringify(data));
    return [];
  }
  return data.results;
}

// Use Claude to write quality summaries for a set of articles
async function writeSummaries(articles) {
  const articlesText = articles
    .map(
      (a, i) =>
        `--- Article ${i + 1} ---\n` +
        `Title: ${a.title}\n` +
        `URL: ${a.url}\n` +
        `Published: ${a.publishedDate?.split('T')[0] ?? 'unknown'}\n` +
        `Source: ${a.author ?? new URL(a.url).hostname}\n` +
        `Full text:\n${a.text ?? a.snippet ?? '(no content)'}`
    )
    .join('\n\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: {
      type: 'text',
      text: 'You are an AI news editor for Spark I/O, a tech-focused website. Your job is to write clean, substantive news entries from raw article text.',
      cache_control: { type: 'ephemeral' },
    },
    messages: [
      {
        role: 'user',
        content:
          `Given the ${articles.length} AI news articles below, return a JSON array with one object per article.\n\n` +
          `Each object must have exactly these fields:\n` +
          `- "title": clean headline, no source suffix\n` +
          `- "summary": one sentence capturing the core news\n` +
          `- "content": 3–5 sentences with real substance — key facts, numbers, context. Not a teaser.\n` +
          `- "source": publication name (e.g. "Reuters", "TechCrunch")\n` +
          `- "date": YYYY-MM-DD\n` +
          `- "url": exact URL from the article\n` +
          `- "category": one of Models | Industry | Trends | Policy | Tools\n\n` +
          `Return ONLY a valid JSON array. No markdown, no code fences, no commentary.\n\n` +
          articlesText,
      },
    ],
  });

  const raw = message.content[0].text.trim();
  return JSON.parse(raw);
}

async function run() {
  console.log('Searching for AI news via Exa...');

  // Run 4 targeted searches in parallel
  const [general, models, policy, tools] = await Promise.all([
    exaSearch('major artificial intelligence news announcement this week', 6),
    exaSearch('new AI model release launch 2026', 5),
    exaSearch('AI regulation policy government update 2026', 4),
    exaSearch('AI tools product launch enterprise adoption 2026', 4),
  ]);

  // Deduplicate by URL, keep most recent first
  const seen = new Set();
  const candidates = [...general, ...models, ...policy, ...tools].filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Take the 8 most recent to give Claude good material to select from
  const top = candidates
    .sort((a, b) => new Date(b.publishedDate ?? 0) - new Date(a.publishedDate ?? 0))
    .slice(0, 8);

  console.log(`Fetched ${candidates.length} unique articles, passing top ${top.length} to Claude...`);

  const articles = await writeSummaries(top);

  writeFileSync(NEWS_FILE, JSON.stringify(articles.slice(0, 6), null, 2) + '\n');
  console.log(`Done — wrote ${Math.min(articles.length, 6)} articles.`);
  articles.slice(0, 6).forEach(a => console.log(`  [${a.category}] ${a.title}`));
}

run().catch(err => { console.error(err); process.exit(1); });
