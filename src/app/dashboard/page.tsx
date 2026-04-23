'use client';
import { useEffect, useState } from 'react';
import { requestForToken } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string, role: string, name: string } | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (id && role && name) {
      setUser({ id, role, name });
      initFCM(id);
      fetchTasks();
    } else {
      router.push('/');
    }
  }, [router]);

  const initFCM = async (userId: string) => {
    const token = await requestForToken();
    if (token) {
      console.log('FCM Token:', token);
      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token })
      });
    }
  };

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const assignTask = async () => {
    if (!newTask) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask, managerId: user?.id, staffId: '2' })
    });
    setNewTask('');
    fetchTasks();
  };

  const markDone = async (task: any) => {
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, managerId: task.manager_id, title: task.title })
    });
    fetchTasks();
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Dashboard - {user.name} ({user.role})</h1>
        <button onClick={logout} className="text-red-500 font-semibold hover:underline">Logout</button>
      </div>
      
      {user.role === 'manager' && (
        <div className="mb-8 flex gap-4 bg-gray-100 p-4 rounded-lg">
          <input 
            value={newTask} 
            onChange={e => setNewTask(e.target.value)} 
            placeholder="Tugas baru untuk Rafi..." 
            className="flex-1 border p-2 rounded" 
          />
          <button 
            onClick={assignTask} 
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
            Assign Task
          </button>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Daftar Tugas</h2>
      <div className="flex flex-col gap-4">
        {tasks.map(task => (
          <div key={task.id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold">{task.title}</p>
              <span className={`text-sm font-bold ${task.status === 'done' ? 'text-green-600' : 'text-orange-500'}`}>
                {task.status.toUpperCase()}
              </span>
            </div>
            {user.role === 'staff' && task.status === 'pending' && (
              <button 
                onClick={() => markDone(task)} 
                className="bg-green-500 text-white px-4 py-2 rounded font-semibold">
                Selesaikan
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}