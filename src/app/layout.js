import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Database Management System',
  description: 'Database Management System - Next.js + PostgreSQL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="dashboard">
          {/* Sidebar */}
          <aside className="sidebar">
            <h2>DB SYSTEM</h2>
            <nav>
              <Link href="/">Customers</Link>
              <Link href="/produk">Products</Link>
              <Link href="/penjualan">Sales</Link>
              <Link href="/laporan">Reports</Link>
            </nav>
          </aside>

          {/* Main content */}
          <div className="main">
            <header className="header">
              <h1>Dashboard</h1>
            </header>
            <div className="content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
