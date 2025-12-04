import { supabase } from './supabase-config.js';

/**
 * Fetch all experiences from Supabase
 * @returns {Promise<Array>} Array of experience objects
 */
export async function fetchExperiences() {
    try {
        const { data, error } = await supabase
            .from('experiences')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching experiences:', error);
            throw error;
        }

        return data || [];
    } catch (err) {
        console.error('Failed to fetch experiences:', err);
        return [];
    }
}
