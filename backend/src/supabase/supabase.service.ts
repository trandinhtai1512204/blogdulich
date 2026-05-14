import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

if (!globalThis.WebSocket) {
  (
    globalThis as typeof globalThis & { WebSocket: typeof globalThis.WebSocket }
  ).WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}

@Injectable()
export class SupabaseService {
  readonly anon: ReturnType<typeof createClient>;
  readonly admin: ReturnType<typeof createClient>;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const opts = { auth: { autoRefreshToken: false, persistSession: false } };

    this.anon = createClient(url, anonKey, opts);
    this.admin = createClient(url, serviceRoleKey, opts);
  }
}
