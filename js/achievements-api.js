import { supabase } from './supabase-config.js';

/**
 * Fetch all achievements, ordered by pinned status then creation date
 * @returns {Promise<Array>} - List of achievements
 */
export async function fetchAchievements() {
    const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }

    return data;
}
