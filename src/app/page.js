'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [pelanggan, setPelanggan] = useState([]);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');

  // Ambil data dari API
  const fetchPelanggan = async () => {
    const res = await fetch('/api/pelanggan');
    const data = await res.json();
    setPelanggan(data);
  };

  useEffect(() => {
    fetchPelanggan();
  }, []);

  // Tambah pelanggan baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/pelanggan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email }),
    });
    setNama('');
    setEmail('');
    fetchPelanggan();
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus pelanggan ini? Semua data penjualan terkait juga akan terhapus!')) {
      const loadingToast = toast.loading('Menghapus pelanggan dan semua data terkait...');
      try {
        const res = await fetch(`/api/pelanggan/${id}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await res.json();
        toast.dismiss(loadingToast);
        
        if (res.ok && data.success) {
          toast.success('✅ Pelanggan dan semua data terkait berhasil dihapus!');
          // Langsung update UI tanpa fetch ulang untuk responsivitas
          setPelanggan(prev => prev.filter(p => p.id !== id));
        } else {
          toast.error(`❌ ${data.error || 'Gagal menghapus pelanggan'}`);
          console.error('Delete failed:', data);
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('❌ Error saat menghapus pelanggan');
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <main>
      <Toaster position="top-right" />
      <h1>Customer Data</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Add Customer</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pelanggan.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nama}</td>
              <td>{p.email}</td>
              <td>
                <button onClick={() => handleDelete(p.id)} className="delete-btn" title="Hapus Pelanggan">
                  <svg className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                  </svg>
                  Hapus
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
