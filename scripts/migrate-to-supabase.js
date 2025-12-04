require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BLOG_DIR = path.join(__dirname, '../blog');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for admin access

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function extractFrontmatter(md) {
    const match = md.match(/^---([\s\S]*?)---/);
    if (!match) return { content: md, data: {} };

    const frontmatterRaw = match[1];
    const content = md.replace(match[0], '').trim();

    const data = {};
    frontmatterRaw.trim().split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim().replace(/^"|"$/g, '');
            data[key] = value;
        }
    });

    return { content, data };
}

async function migrate() {
    console.log('Starting migration...');

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files.`);

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(BLOG_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { content, data } = extractFrontmatter(fileContent);

        const slug = file.replace('.md', '');

        const post = {
            title: data.title || slug,
            slug: slug,
            content: content,
            excerpt: data.excerpt || content.substring(0, 150) + '...',
            genre: data.genre || 'tech', // Default genre
            image_url: data.image || null,
            published_at: data.date ? new Date(data.date) : new Date(),
            is_published: true,
            read_time: data.readTime || '5 min',
            // You might want to map author_id if you have users set up
        };

        const { error } = await supabase
            .from('blog_posts')
            .upsert(post, { onConflict: 'slug' });

        if (error) {
            console.error(`Error migrating ${file}:`, error);
        } else {
            console.log(`Successfully migrated ${file}`);
        }
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);
