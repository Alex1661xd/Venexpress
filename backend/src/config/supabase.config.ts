import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuración de Supabase para el backend
 * Usa las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 */
export function createSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(
            'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        );
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Nombre del bucket de Storage para comprobantes
 */
export const STORAGE_BUCKET = 'DataVenexpressStorage';

/**
 * Tiempo de expiración por defecto para signed URLs (en segundos)
 * 1 hora = 3600 segundos
 */
export const SIGNED_URL_EXPIRATION = 3600;
