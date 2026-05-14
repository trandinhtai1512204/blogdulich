import { createClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    readonly anon: ReturnType<typeof createClient>;
    readonly admin: ReturnType<typeof createClient>;
    constructor();
}
