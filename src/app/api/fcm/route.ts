import { messagingAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// Endpoint opsional untuk kirim notifikasi manual via Postman
export async function POST(req: Request) {
  const { token, title, body } = await req.json();
  try {
    await messagingAdmin.send({
      token,
      notification: { title, body }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengirim notif' }, { status: 500 });
  }
}