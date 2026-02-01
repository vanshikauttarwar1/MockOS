import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'PM Mock Master',
  description: 'AI-Powered Product Manager Mock Tests',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container" style={{ paddingBottom: '40px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
