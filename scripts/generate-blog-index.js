// scripts/generate-blog-index.js
// Node.js script to generate blog/index.json with metadata for all blog posts

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../blog');
const OUT_FILE = path.join(BLOG_DIR, 'index.json');

function extractFrontmatter(md) {
  const match = md.match(/^---([\s\S]*?)---/);
  if (!match) return {};
  const lines = match[1].trim().split('\n');
  const fm = {};
  lines.forEach(line => {
    const [key, ...rest] = line.split(':');
    fm[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
  });
  return fm;
}

function getExcerpt(md) {
  return md.replace(/^---[\s\S]*?---/, '').replace(/^#+\s*/, '').substring(0, 150) + '...';
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const md = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const fm = extractFrontmatter(md);
    return {
      file,
      title: fm.title || file.replace('.md', ''),
      date: fm.date || '',
      genre: fm.genre || '',
      image: fm.image || 'assets/img/blog-default.jpg',
      readTime: fm.readTime || '',
      excerpt: fm.excerpt || getExcerpt(md)
    };
  });
  fs.writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2));
  console.log(`Wrote ${posts.length} posts to blog/index.json`);
}

main();
