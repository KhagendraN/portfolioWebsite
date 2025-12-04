require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const projects = [
    {
        title: "KN-SOCK",
        description: "A lightweight and powerful socket programming toolkit for Python that makes networking simpler and more Pythonic.",
        image_url: "assets/img/kn-sock.jpg",
        github_url: "https://github.com/KhagendraN/kn-sock",
        demo_url: "",
        tech_stack: ["Python", "Networking"],
        is_pinned: true
    },
    {
        title: "Jarvis-Voice-Assistant",
        description: "A voice-controlled tool that answers questions, sends messages, or performs other tasks with AI-powered responses.",
        image_url: "assets/img/jarvis.jpg",
        github_url: "https://github.com/KhagendraN/AIDesktopAssistant",
        demo_url: "",
        tech_stack: ["Python", "AI"],
        is_pinned: true
    },
    {
        title: "ArchShell",
        description: "Custom shell for Linux-based systems.",
        image_url: "assets/img/arch.jpg",
        github_url: "https://github.com/KhagendraN/ArchShell",
        demo_url: "",
        tech_stack: ["C", "Linux"],
        is_pinned: true
    },
    {
        title: "Chat Application",
        description: "Socket-based P2P chatting application.",
        image_url: "assets/img/chat.jpg",
        github_url: "#",
        demo_url: "",
        tech_stack: ["Python", "Sockets"],
        is_pinned: false
    },
    {
        title: "HTTP Server",
        description: "Simple HTTP server built with Python sockets.",
        image_url: "assets/img/server.jpg",
        github_url: "https://github.com/KhagendraN/simple-http-server",
        demo_url: "",
        tech_stack: ["Python", "Sockets"],
        is_pinned: false
    }
];

async function migrateProjects() {
    console.log('Starting projects migration...');

    for (const project of projects) {
        console.log(`Migrating ${project.title}...`);

        const { error } = await supabase
            .from('projects')
            .insert(project);

        if (error) {
            console.error(`Error migrating ${project.title}:`, error);
        } else {
            console.log(`Successfully migrated ${project.title}`);
        }
    }

    console.log('Projects migration complete!');
}

migrateProjects().catch(console.error);
