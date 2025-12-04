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

const experiences = [
    {
        type: 'education',
        date_range: '2024 - Present',
        role: 'Bachelor of Engineering (Electronics, Communication & Information)',
        description: 'Tribhuvan University - Pulchowk Campus. Expected Graduation: 2028.',
        organization: 'Tribhuvan University - Pulchowk Campus',
        display_order: 1
    },
    {
        type: 'education',
        date_range: '2022 - 2024',
        role: '+2 Science',
        description: 'URBANA School of Science. GPA: 3.92. Graduated: 2024.',
        organization: 'URBANA School of Science',
        display_order: 2
    },
    {
        type: 'experience',
        date_range: '2024 - Present',
        role: 'GitHub Projects Contributor',
        description: 'Actively working on open-source projects hosted on GitHub. Collaborating with developers on code, documentation, and issue tracking.',
        organization: 'Open Source',
        display_order: 3
    },
    {
        type: 'experience',
        date_range: '2024 - Present',
        role: 'Class Representative - BEI081',
        description: 'Liaison between faculty and students for effective communication. Assisted in resolving student concerns and organizing events.',
        organization: 'Pulchowk Campus',
        display_order: 4
    }
];

async function migrateExperiences() {
    console.log('Starting experiences migration...');

    for (const experience of experiences) {
        console.log(`Migrating ${experience.role}...`);

        const { error } = await supabase
            .from('experiences')
            .insert(experience);

        if (error) {
            console.error(`Error migrating ${experience.role}:`, error);
        } else {
            console.log(`Successfully migrated ${experience.role}`);
        }
    }

    console.log('Experiences migration complete!');
}

migrateExperiences().catch(console.error);
