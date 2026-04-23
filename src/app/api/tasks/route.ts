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

export async function POST(req: Request) {
  try {
    const { title, managerId, staffId } = await req.json();
    
    // Tambahkan status 'pending' secara default agar DB tidak error
    await sql`INSERT INTO tasks (title, manager_id, staff_id, status) VALUES (${title}, ${managerId}, ${staffId}, 'pending')`;
    
    const tokens = await sql`SELECT token FROM fcm_tokens WHERE user_id = ${staffId}`;
    const tokenStrings = tokens.map(t => t.token);
    
    if (tokenStrings.length > 0) {
      try {
        await messagingAdmin.sendEachForMulticast({
          tokens: tokenStrings,
          notification: { title: 'Tugas Baru!', body: title }
        });
      } catch (fcmErr) {
        console.error('FCM Error (tapi DB aman):', fcmErr);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Gagal proses' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, managerId, title } = data;

    // VALIDASI KRUSIAL: Jika id atau managerId kosong, HP akan kasih tau lewat log
    if (!id || !managerId) {
      console.error('Data PUT tidak lengkap:', data);
      return NextResponse.json({ error: 'ID atau ManagerID tidak terdeteksi' }, { status: 400 });
    }

    await sql`UPDATE tasks SET status = 'done' WHERE id = ${id}`;
    
    const tokens = await sql`SELECT token FROM fcm_tokens WHERE user_id = ${managerId}`;
    const tokenStrings = tokens.map(t => t.token);
    
    if (tokenStrings.length > 0) {
      try {
        await messagingAdmin.sendEachForMulticast({
          tokens: tokenStrings,
          notification: { title: 'Tugas Selesai!', body: `Staff menyelesaikan: ${title || 'Tugas'}` }
        });
      } catch (fcmErr) {
        console.error('FCM Error (tapi DB update sukses):', fcmErr);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT Error Detail:', error);
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 });
  }
}