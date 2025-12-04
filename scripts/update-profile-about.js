require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProfileWithAbout() {
    console.log('Starting profile update with About section...');

    // Check if profile exists
    const { data: existing, error: fetchError } = await supabase
        .from('profile')
        .select('*')
        .single();

    if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return;
    }

    if (!existing) {
        console.log('No profile found. Please run migrate-profile.js first.');
        return;
    }

    // Update with About section defaults if not already set
    const updateData = {};
    if (!existing.about_image_url) {
        updateData.about_image_url = 'assets/img/about.png';
    }
    if (!existing.about_subtitle) {
        updateData.about_subtitle = "I'm Khagendra Neupane";
    }
    if (!existing.about_text) {
        updateData.about_text = 'I am a Bachelor of Engineering (Electronics, Communication & Information) student at Tribhuvan University, Pulchowk Campus, expected to graduate in 2028. I am passionate about networking, cybersecurity, and AI/ML, and enjoy bridging academic learning with practical applications. I am committed to contributing to open-source projects and fostering effective communication within my academic community.';
    }

    if (Object.keys(updateData).length === 0) {
        console.log('Profile already has About section data. No update needed.');
        return;
    }

    const { data, error } = await supabase
        .from('profile')
        .update(updateData)
        .eq('id', existing.id)
        .select();

    if (error) {
        console.error('Error updating profile:', error);
    } else {
        console.log('Successfully updated profile with About section:', data);
    }

    console.log('Profile update complete!');
}

updateProfileWithAbout();
