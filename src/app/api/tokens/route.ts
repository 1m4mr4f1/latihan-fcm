import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();
    await sql`
      INSERT INTO fcm_tokens (user_id, token) 
      VALUES (${userId}, ${token})
      ON CONFLICT (token) DO NOTHING;
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal simpan token' }, { status: 500 });
  }
}