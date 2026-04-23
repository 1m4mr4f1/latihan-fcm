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

// Manager menambahkan task -> Kirim FCM ke Staff
export async function POST(req: Request) {
  try {
    const { title, managerId, staffId } = await req.json();
    await sql`INSERT INTO tasks (title, manager_id, staff_id) VALUES (${title}, ${managerId}, ${staffId})`;
    
    const tokens = await sql`SELECT token FROM fcm_tokens WHERE user_id = ${staffId}`;
    const tokenStrings = tokens.map(t => t.token);
    
    if (tokenStrings.length > 0) {
      await messagingAdmin.sendEachForMulticast({
        tokens: tokenStrings,
        notification: { title: 'Tugas Baru!', body: title }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal proses' }, { status: 500 });
  }
}

// Staff menyelesaikan task -> Kirim FCM ke Manager
export async function PUT(req: Request) {
  try {
    const { id, managerId, title } = await req.json();
    await sql`UPDATE tasks SET status = 'done' WHERE id = ${id}`;
    
    const tokens = await sql`SELECT token FROM fcm_tokens WHERE user_id = ${managerId}`;
    const tokenStrings = tokens.map(t => t.token);
    
    if (tokenStrings.length > 0) {
      await messagingAdmin.sendEachForMulticast({
        tokens: tokenStrings,
        notification: { title: 'Tugas Selesai!', body: `Staff menyelesaikan: ${title}` }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 });
  }
}