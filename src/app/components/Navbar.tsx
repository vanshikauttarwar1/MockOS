'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    // Check if we are in a test or session flow (hide extra nav items)
    const isTestMode = pathname.startsWith('/test/') || pathname.startsWith('/session/');

    return (
        <nav style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--glass)', // Light glass
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href="/" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <img src="/logo.png" alt="SwitchOS Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        SwitchOS <span style={{ opacity: 0.5, fontWeight: 500 }}>PM Mock</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', gap: '32px', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dim)' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: pathname === '/' ? 'var(--text-main)' : 'inherit' }}>
                        Dashboard
                    </Link>

                    {!isTestMode && (
                        <>
                            <Link href="/history" style={{ textDecoration: 'none', color: pathname === '/history' ? 'var(--text-main)' : 'inherit' }}>
                                History
                            </Link>
                            {/* Profile is a placeholder for now */}
                            <span style={{ cursor: 'not-allowed', opacity: 0.5 }}>Profile</span>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
