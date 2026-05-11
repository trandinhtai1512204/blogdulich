import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Polyfill WebSocket cho Node.js < 22
if (!globalThis.WebSocket) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { WebSocket } = require('ws');
  (globalThis as any).WebSocket = WebSocket;
}

@Injectable()
export class SupabaseService {
  readonly anon: SupabaseClient;
  readonly admin: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL!;
    const opts = { auth: { autoRefreshToken: false, persistSession: false } };

    this.anon = createClient(url, process.env.SUPABASE_ANON_KEY!, opts);
    this.admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, opts);
  }
}
