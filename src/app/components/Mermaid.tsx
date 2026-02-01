'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

interface MermaidProps {
    chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.contentLoaded();
            // We use a unique ID for each diagram to prevent conflicts
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

            // Clear previous content
            ref.current.innerHTML = `<div id="${id}">${chart}</div>`;

            try {
                mermaid.init(undefined, `#${id}`);
            } catch (error) {
                console.error("Mermaid initialization failed:", error);
            }
        }
    }, [chart]);

    return (
        <div
            className="mermaid-container"
            style={{
                margin: '24px 0',
                padding: '20px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflowX: 'auto',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <div ref={ref} className="mermaid" />
        </div>
    );
};

export default Mermaid;
