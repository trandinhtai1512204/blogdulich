import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    readonly anon: SupabaseClient;
    readonly admin: SupabaseClient;
    constructor();
}
