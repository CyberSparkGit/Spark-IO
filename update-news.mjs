#!/usr/bin/env node

// update-news.mjs — AI news updater powered entirely by Exa
//
// Required env var:
//   EXA_API_KEY — from exa.ai

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_FILE = join(__dirname, 'news.json');

const EXA_API_KEY = process.env.EXA_API_KEY;
if (!EXA_API_KEY) { console.error('Missing EXA_API_KEY'); process.exit(1); }

// Search Exa and return results with highlights + snippet
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
      contents: {
        text: { maxCharacters: 300 },   // short snippet for summary
        highlights: {
          numSentences: 2,              // 2 sentences per highlight chunk
          highlightsPerUrl: 3,          // 3 chunks = ~5-6 sentences for content
        },
      },
    }),
  });

  const data = await res.json();
  if (!data.results) { console.error('Exa error:', JSON.stringify(data)); return []; }
  return data.results;
}

// Category mapping — first match wins
const CATEGORY_MAP = [
  {
    keywords: ['gpt', 'claude', 'gemini', 'llama', 'model', 'llm', 'mistral',
               'foundation model', 'language model', 'grok', 'muse', 'mythos',
               'reasoning model', 'multimodal'],
    category: 'Models',
  },
  {
    keywords: ['regulation', 'law', 'policy', 'act', 'govern', 'compliance',
               'ban', 'framework', 'congress', 'senate', 'white house', 'eu ai'],
    category: 'Policy',
  },
  {
    keywords: ['copilot', 'tool', 'app', 'platform', 'launch', 'release',
               'feature', 'product', 'plugin', 'extension', 'update', 'version',
               'skill', 'assistant', 'agent'],
    category: 'Tools',
  },
  {
    keywords: ['trend', 'survey', 'report', 'adoption', 'market', 'growth',
               'study', 'forecast', 'investment', 'revenue', 'funding', 'ceo'],
    category: 'Trends',
  },
];

function categorize(title, text) {
  const haystack = `${title} ${text ?? ''}`.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some(kw => haystack.includes(kw))) return category;
  }
  return 'Industry';
}

function buildArticle(r) {
  const title = r.title
    ?.replace(/ [-|–] [^-|–]+$/, '')  // strip "- Source" or "| Source" suffix
    .trim() ?? 'Untitled';

  // summary: first sentence of the text snippet
  const summary = (r.text ?? '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .find(s => s.length > 40) ?? r.text ?? '';

  // content: join the highlights Exa extracted
  const content = (r.highlights ?? [])
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || summary;

  const source = r.author
    ?? (() => { try { return new URL(r.url).hostname.replace(/^www\./, ''); } catch { return 'Unknown'; } })();

  return {
    title,
    summary: summary.slice(0, 300),
    content,
    source,
    date: r.publishedDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    url: r.url,
    category: categorize(title, r.text),
  };
}

async function run() {
  console.log('Searching for AI news via Exa...');

  const [general, models, policy, tools] = await Promise.all([
    exaSearch('major artificial intelligence news announcement this week', 6),
    exaSearch('new AI model release launch 2026', 5),
    exaSearch('AI regulation policy government update 2026', 4),
    exaSearch('AI tools product launch enterprise adoption 2026', 4),
  ]);

  // Deduplicate by URL, keep most recent first
  const seen = new Set();
  const articles = [...general, ...models, ...policy, ...tools]
    .filter(r => r.url && !seen.has(r.url) && seen.add(r.url))
    .sort((a, b) => new Date(b.publishedDate ?? 0) - new Date(a.publishedDate ?? 0))
    .slice(0, 6)
    .map(buildArticle);

  if (articles.length < 6) {
    console.warn(`Warning: only ${articles.length} articles found (expected 6).`);
  }

  writeFileSync(NEWS_FILE, JSON.stringify(articles, null, 2) + '\n');
  console.log(`Done — wrote ${articles.length} articles.`);
  articles.forEach(a => console.log(`  [${a.category}] ${a.title}`));
}

run().catch(err => { console.error(err); process.exit(1); });
