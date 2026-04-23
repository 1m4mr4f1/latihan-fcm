'use client';
import { useRouter } from 'next/navigation';

export default function MockLogin() {
  const router = useRouter();

  const handleLogin = (id: string, role: string, name: string) => {
    localStorage.setItem('user_id', id);
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50">
      <h1 className="text-3xl font-bold">Pilih Akun Login</h1>
      <button 
        onClick={() => handleLogin('1', 'manager', 'Budi')} 
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
        Login sebagai Manager (Budi)
      </button>
      <button 
        onClick={() => handleLogin('2', 'staff', 'Rafi')} 
        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
        Login sebagai Staff (Rafi)
      </button>
    </div>
  );
}