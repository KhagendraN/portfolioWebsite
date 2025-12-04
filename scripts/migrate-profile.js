require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const initialProfile = {
    hero_image_url: 'assets/img/perfil.png', // Default from current site
    cv_url: 'assets/files/khagendra_cv.pdf'  // Default from current site
};

async function migrateProfile() {
    console.log('Starting profile migration...');

    // Check if profile exists
    const { data: existing, error: fetchError } = await supabase
        .from('profile')
        .select('*')
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error('Error checking existing profile:', fetchError);
        return;
    }

    if (existing) {
        console.log('Profile already exists. Skipping...');
        return;
    }

    // Insert profile
    const { data, error } = await supabase
        .from('profile')
        .insert(initialProfile)
        .select();

    if (error) {
        console.error('Error creating profile:', error);
    } else {
        console.log('Successfully created initial profile:', data);
    }

    console.log('Profile migration complete!');
}

migrateProfile();
