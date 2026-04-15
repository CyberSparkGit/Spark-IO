#!/usr/bin/env node

// update-news.mjs
// Fetches latest AI news and writes to news.json
// Run manually or via cron: node update-news.mjs
//
// Uses NewsAPI.org — set your API key:
//   export NEWS_API_KEY=your_key_here
//
// Free tier: 100 requests/day, which is plenty for a daily cron.
// Sign up at: https://newsapi.org/register

import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NEWS_FILE = join(__dirname, 'news.json');

const API_KEY = process.env.NEWS_API_KEY;

// Category mapping — keywords to categories
const CATEGORY_MAP = [
  { keywords: ['gpt', 'claude', 'gemini', 'llama', 'model', 'llm', 'mistral'], category: 'Models' },
  { keywords: ['regulation', 'law', 'policy', 'act', 'govern', 'compliance', 'ban'], category: 'Policy' },
  { keywords: ['copilot', 'tool', 'app', 'platform', 'launch', 'release', 'feature'], category: 'Tools' },
  { keywords: ['trend', 'survey', 'report', 'adoption', 'market', 'growth', 'study'], category: 'Trends' },
];

function categorize(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some(kw => text.includes(kw))) return category;
  }
  return 'Industry';
}

// NewsAPI free tier truncates content with "[+XXXX chars]" — strip it.
// Fall back to description if the result is too short to be useful.
function buildContent(content, description) {
  if (!content) return description || 'No content available.';
  const cleaned = content.replace(/\s*\[?\+\d+ chars\]?\s*$/, '').trim();
  return cleaned.length >= 80 ? cleaned : (description || cleaned);
}

async function fetchNews() {
  if (!API_KEY) {
    console.error('ERROR: Set NEWS_API_KEY environment variable.');
    console.error('Get a free key at: https://newsapi.org/register');
    process.exit(1);
  }

  const query = encodeURIComponent('artificial intelligence OR AI OR "machine learning" OR ChatGPT OR Claude OR GPT');
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=6&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') {
      console.error('API error:', data.message);
      process.exit(1);
    }

    const articles = data.articles
      .filter(a => a.title && a.title !== '[Removed]')
      .slice(0, 6)
      .map(a => ({
        title: a.title.replace(/ - .*$/, ''), // strip source suffix
        summary: a.description || 'No summary available.',
        content: buildContent(a.content, a.description),
        source: a.source?.name || 'Unknown',
        date: a.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        url: a.url || '#',
        category: categorize(a.title, a.description || ''),
      }));

    // Write the news file
    writeFileSync(NEWS_FILE, JSON.stringify(articles, null, 2) + '\n');
    console.log(`Updated ${articles.length} articles at ${new Date().toISOString()}`);
    articles.forEach(a => console.log(`  - [${a.category}] ${a.title}`));

  } catch (err) {
    console.error('Fetch failed:', err.message);
    process.exit(1);
  }
}

fetchNews();
