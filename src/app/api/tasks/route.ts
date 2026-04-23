import { sql } from '@/lib/db';
import { messagingAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal fetch tasks' }, { status: 500 });
  }
}

// 1. POST: Manager membuat tugas untuk Staff tertentu
export async function POST(req: Request) {
  try {
    const { title, managerId, staffId } = await req.json();

    // Simpan ke database
    await sql`
      INSERT INTO tasks (title, manager_id, staff_id, status) 
      VALUES (${title}, ${managerId}, ${staffId}, 'pending')
    `;
    
    // CARI TOKEN: Hanya milik Staff yang dituju (staffId)
    const rows = await sql`SELECT token FROM fcm_tokens WHERE user_id = ${staffId}`;
    const tokens = rows.map(r => r.token);
    
    // KIRIM NOTIF: Hanya ke perangkat milik Staff tersebut
    if (tokens.length > 0) {
      await messagingAdmin.sendEachForMulticast({
        tokens: tokens,
        notification: { 
          title: 'Tugas Baru!', 
          body: `Manager memberi tugas: ${title}` 
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Gagal membuat tugas' }, { status: 500 });
  }
}

// 2. PUT: Staff menyelesaikan tugas -> Lapor ke Manager
export async function PUT(req: Request) {
  try {
    const { id, managerId, title } = await req.json();

    // Update status di database
    await sql`UPDATE tasks SET status = 'done', updated_at = NOW() WHERE id = ${id}`;
    
    // CARI TOKEN: Hanya milik Manager yang memberikan tugas (managerId)
    const rows = await sql`SELECT token FROM fcm_tokens WHERE user_id = ${managerId}`;
    const tokens = rows.map(r => r.token);
    
    // KIRIM NOTIF: Hanya ke perangkat milik Manager
    if (tokens.length > 0) {
      await messagingAdmin.sendEachForMulticast({
        tokens: tokens,
        notification: { 
          title: 'Tugas Selesai!', 
          body: `Staff telah menyelesaikan: ${title}` 
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Gagal update tugas' }, { status: 500 });
  }
}