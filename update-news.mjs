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

// Freshness window: keep the feed tight so stale items fall off quickly.
const FRESHNESS_DAYS = 3;
const TARGET_ARTICLES = 6;

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
      category: 'news',
      startPublishedDate: new Date(Date.now() - FRESHNESS_DAYS * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      contents: {
        text: { maxCharacters: 300 },
        highlights: {
          numSentences: 2,
          highlightsPerUrl: 3,
        },
      },
    }),
  });

  const data = await res.json();
  if (!data.results) { console.error('Exa error:', JSON.stringify(data)); return []; }
  return data.results;
}

// Frontier labs / models — strong signal that a story is core AI news.
const FRONTIER_SIGNALS = [
  'anthropic', 'claude', 'openai', 'gpt', 'chatgpt', 'google deepmind', 'deepmind',
  'gemini', 'meta ai', 'llama', 'xai', 'grok', 'mistral', 'deepseek', 'qwen',
  'nvidia', 'hugging face', 'cohere', 'perplexity',
];

// Concrete AI-news actions — launch, release, benchmark, safety, research.
const ACTION_SIGNALS = [
  'release', 'launch', 'announce', 'unveil', 'debut', 'introduce', 'ship',
  'benchmark', 'state-of-the-art', 'sota', 'open source', 'open-source',
  'fine-tune', 'training run', 'context window', 'reasoning', 'multimodal',
  'research paper', 'safety', 'alignment', 'red team', 'jailbreak',
];

// Penalise obvious non-AI-core PR noise.
const NOISE_SIGNALS = [
  'strategic portfolio', 'workforce management', 'supply chain',
  'field service', 'marketing automation', 'erp ', 'crm ',
  'quarterly results', 'earnings call', 'first-quarter', 'fourth-quarter',
  'q1 2026', 'q2 2026', 'q3 2026', 'q4 2026',
];

// Low-signal wires: useful when they syndicate a frontier lab press release,
// but should never carry the feed on their own merit.
const WIRE_DOMAINS = ['prnewswire.com', 'businesswire.com', 'globenewswire.com'];

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

// Score a result by how clearly it's frontier-AI news. Higher = more relevant.
function scoreResult(r) {
  const haystack = `${r.title ?? ''} ${r.text ?? ''}`.toLowerCase();
  let score = 0;

  for (const sig of FRONTIER_SIGNALS) if (haystack.includes(sig)) score += 3;
  for (const sig of ACTION_SIGNALS)   if (haystack.includes(sig)) score += 1;
  for (const sig of NOISE_SIGNALS)    if (haystack.includes(sig)) score -= 4;

  // Recency bonus: today = +3, yesterday = +2, two days ago = +1.
  const published = r.publishedDate ? new Date(r.publishedDate) : null;
  if (published) {
    const ageDays = (Date.now() - published.getTime()) / (24 * 60 * 60 * 1000);
    if (ageDays < 1) score += 3;
    else if (ageDays < 2) score += 2;
    else if (ageDays < 3) score += 1;
  }

  // Wire services get a small penalty unless a frontier lab is the subject.
  if (WIRE_DOMAINS.includes(hostname(r.url))) {
    const mentionsFrontier = FRONTIER_SIGNALS.some(s => haystack.includes(s));
    if (!mentionsFrontier) score -= 3;
  }

  return score;
}

// Category mapping — first match wins
const CATEGORY_MAP = [
  {
    keywords: ['gpt', 'claude', 'gemini', 'llama', 'llm', 'mistral', 'grok',
               'deepseek', 'qwen', 'foundation model', 'language model',
               'reasoning model', 'multimodal', 'frontier model'],
    category: 'Models',
  },
  {
    keywords: ['regulation', 'law', 'policy', 'govern', 'compliance',
               'ban', 'congress', 'senate', 'white house', 'eu ai act',
               'export control'],
    category: 'Policy',
  },
  {
    keywords: ['copilot', 'assistant', 'agent', 'plugin', 'extension',
               'feature', 'product', 'app', 'platform'],
    category: 'Tools',
  },
  {
    keywords: ['trend', 'survey', 'adoption', 'market', 'growth',
               'forecast', 'investment', 'revenue', 'funding', 'valuation'],
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

// Strip common web-page artefacts from scraped text
function cleanText(text) {
  return text
    .replace(/Skip to (Content|Footer|Navigation|Main)[^.]*?(?=[A-Z])/gi, '')
    .replace(/✕\s*/g, '')
    .replace(/(Main\s+)?Menu\s*(Menu)?\s*#?\s*/gi, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/---+/g, '')
    .replace(/\d+%\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalise a title for near-duplicate detection across outlets.
function titleKey(title) {
  return (title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 8)
    .join(' ');
}

function buildArticle(r) {
  const title = r.title
    ?.replace(/ [-|–] [^-|–]+$/, '')
    .trim() ?? 'Untitled';

  const cleaned = cleanText(r.text ?? '');
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.length > 30);
  const summary = sentences.slice(0, 2).join(' ').slice(0, 300) || cleaned.slice(0, 300);

  const content = cleanText((r.highlights ?? []).join(' ')) || summary;

  const source = r.author
    ?? (() => { try { return new URL(r.url).hostname.replace(/^www\./, ''); } catch { return 'Unknown'; } })();

  return {
    title,
    summary,
    content,
    source,
    date: r.publishedDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    url: r.url,
    category: categorize(title, r.text),
    image: r.image || null,
  };
}

async function run() {
  console.log('Searching for AI news via Exa...');

  // Queries are split by lab and topic so one dominant story can't crowd out
  // everything else, and so frontier-lab releases are explicitly sought.
  const queries = [
    'Anthropic Claude new model release announcement',
    'OpenAI GPT new model release announcement',
    'Google DeepMind Gemini new model release announcement',
    'Meta Llama xAI Grok Mistral DeepSeek new model release',
    'AI research breakthrough benchmark paper this week',
    'AI regulation policy government announcement this week',
    'AI funding acquisition billion dollar deal this week',
  ];

  const batches = await Promise.all(queries.map(q => exaSearch(q, 5)));
  const raw = batches.flat();

  // Dedupe by URL first, then by normalised title so the same story from two
  // outlets doesn't consume two slots.
  const seenUrls = new Set();
  const seenTitles = new Set();
  const unique = [];
  for (const r of raw) {
    if (!r.url || seenUrls.has(r.url)) continue;
    const tkey = titleKey(r.title);
    if (tkey && seenTitles.has(tkey)) continue;
    seenUrls.add(r.url);
    if (tkey) seenTitles.add(tkey);
    unique.push(r);
  }

  // Rank by relevance score, break ties by recency.
  const ranked = unique
    .map(r => ({ r, score: scoreResult(r) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.r.publishedDate ?? 0) - new Date(a.r.publishedDate ?? 0);
    })
    .slice(0, TARGET_ARTICLES)
    .map(({ r }) => buildArticle(r));

  if (ranked.length < TARGET_ARTICLES) {
    console.warn(`Warning: only ${ranked.length} articles passed relevance filter (expected ${TARGET_ARTICLES}).`);
  }

  writeFileSync(NEWS_FILE, JSON.stringify(ranked, null, 2) + '\n');
  console.log(`Done — wrote ${ranked.length} articles.`);
  ranked.forEach(a => console.log(`  [${a.category}] ${a.title}`));
}

run().catch(err => { console.error(err); process.exit(1); });
