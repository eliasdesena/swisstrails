/**
 * Feature flags. Pure compile-time constants — flip and rebuild.
 *
 * Hike Buddy is fully built but intentionally gated off until launch. While
 * this is `false` the route renders a "Coming Soon" state and the profile
 * menu entry is shown disabled.
 */
export const HIKE_BUDDY_ENABLED = false;

/**
 * Supabase-backed image uploads (highest priority image source). Supabase is
 * not connected yet, so this stays `false`: the admin editor shows the upload
 * control disabled ("coming soon") and the image resolver skips the Supabase
 * slot entirely. Flip to `true` once `location_images` uploads are wired.
 */
export const SUPABASE_IMAGES_ENABLED = false;
