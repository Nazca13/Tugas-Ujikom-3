'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ProdukPage() {
    const [produk, setProduk] = useState([]);
    const [nama, setNama] = useState('');
    const [harga, setHarga] = useState('');
    const [stok, setStok] = useState('');
    const [editId, setEditId] = useState(null); // State untuk melacak ID produk yang diedit

    const fetchProduk = async () => {
        const res = await fetch('/api/produk');
        const data = await res.json();
        setProduk(data);
    };

    useEffect(() => {
        fetchProduk();
    }, []);

    const handleCancelEdit = () => {
        setEditId(null);
        setNama('');
        setHarga('');
        setStok('');
    };

    const handleEdit = (p) => {
        setEditId(p.id);
        setNama(p.nama);
        setHarga(p.harga.toString());
        setStok(p.stok.toString());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editId ? `/api/produk/${editId}` : '/api/produk';
        const method = editId ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, harga: parseFloat(harga), stok: parseInt(stok) }),
        });

        handleCancelEdit();
        fetchProduk();
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin ingin menghapus produk ini? Semua data penjualan terkait juga akan terhapus!')) {
            const loadingToast = toast.loading('Menghapus produk dan semua data terkait...');
            try {
                const res = await fetch(`/api/produk/${id}`, { 
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await res.json();
                toast.dismiss(loadingToast);
                
                if (res.ok && data.success) {
                    toast.success('✅ Produk dan semua data terkait berhasil dihapus!');
                    // Langsung update UI tanpa fetch ulang untuk responsivitas
                    setProduk(prev => prev.filter(p => p.id !== id));
                } else {
                    toast.error(`❌ ${data.error || 'Gagal menghapus produk'}`);
                    console.error('Delete failed:', data);
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error('❌ Error saat menghapus produk');
                console.error('Delete error:', error);
            }
        }
    };

    return (
        <main>
            <Toaster position="top-right" />
            <h1>Product Data</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Product Name"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Stock"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    required
                />
                <button type="submit">{editId ? 'Update Product' : 'Add Product'}</button>
                {editId && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {produk.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nama}</td>
                            <td>Rp {p.harga}</td>
                            <td>{p.stok}</td>
                            <td>
                                <button onClick={() => handleEdit(p)} className="edit-btn" title="Edit Produk">Edit</button>
                                <button onClick={() => handleDelete(p.id)} className="delete-btn" title="Hapus Produk">
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
