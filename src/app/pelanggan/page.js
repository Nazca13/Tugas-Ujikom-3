'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function PelangganPage() {
    const [pelanggan, setPelanggan] = useState([]);
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [alamat, setAlamat] = useState('');
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [editId, setEditId] = useState(null);

    const fetchPelanggan = async () => {
        const res = await fetch('/api/pelanggan');
        const data = await res.json();
        setPelanggan(data);
    };

    useEffect(() => {
        fetchPelanggan();
    }, []);

    const handleCancelEdit = () => {
        setEditId(null);
        setNama('');
        setEmail('');
        setAlamat('');
        setNomorTelepon('');
    };

    const handleEdit = (p) => {
        setEditId(p.id);
        setNama(p.nama);
        setEmail(p.email);
        setAlamat(p.alamat || '');
        setNomorTelepon(p.nomorTelepon || '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editId ? `/api/pelanggan/${editId}` : '/api/pelanggan';
        const method = editId ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, email, alamat, nomorTelepon }),
        });

        handleCancelEdit();
        fetchPelanggan();
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin ingin menghapus pelanggan ini? Semua data penjualan terkait juga akan terhapus!')) {
            const loadingToast = toast.loading('Menghapus pelanggan...');
            try {
                const res = await fetch(`/api/pelanggan/${id}`, { method: 'DELETE' });
                const data = await res.json();
                toast.dismiss(loadingToast);

                if (res.ok && data.success) {
                    toast.success('✅ Pelanggan berhasil dihapus!');
                    setPelanggan(prev => prev.filter(p => p.id !== id));
                } else {
                    toast.error(`❌ ${data.error || 'Gagal menghapus pelanggan'}`);
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error('❌ Error saat menghapus pelanggan');
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
                    placeholder="Customer Name"
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
                <input
                    type="text"
                    placeholder="Alamat"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nomor Telepon"
                    value={nomorTelepon}
                    onChange={(e) => setNomorTelepon(e.target.value)}
                />
                <button type="submit">{editId ? 'Update Customer' : 'Add Customer'}</button>
                {editId && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Alamat</th>
                        <th>No. Telepon</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pelanggan.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nama}</td>
                            <td>{p.email}</td>
                            <td>{p.alamat}</td>
                            <td>
                                <div className="action-buttons">
                                    <button onClick={() => handleEdit(p)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(p.id)} className="delete-btn">Hapus</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
