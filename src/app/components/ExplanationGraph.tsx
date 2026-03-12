'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartConfiguration
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ExplanationGraphProps {
    config: ChartConfiguration;
}

const ExplanationGraph: React.FC<ExplanationGraphProps> = ({ config }) => {
    if (!config || !config.data) return null;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#ccc' }
            },
            title: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                display: !!(config.options as any)?.title,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: (config.options as any)?.title?.text,
                color: '#fff'
            },
        },
        scales: {
            x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
            y: { ticks: { color: '#aaa' }, grid: { color: '#333' } }
        }
    };

    const type = config.type?.toLowerCase();

    // Mapping chart type string to RJS2 component
    // Note: Chart.js config structure usually has `type` at root.
    // react-chartjs-2 usually takes `data` and `options` props.

    // Simplification: We support 'bar' and 'line' primarily for now.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartData: any = config.data;

    return (
        <div className="w-full max-w-lg mx-auto bg-gray-900 p-4 rounded-lg my-4 border border-gray-700">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {type === 'bar' && <Bar options={options as any} data={chartData} />}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {type === 'line' && <Line options={options as any} data={chartData} />}
            {/* Fallback or other types could be added here */}
            {!['bar', 'line'].includes(type) && <p className="text-red-400">Unsupported chart type: {type}</p>}
        </div>
    );
};

export default ExplanationGraph;
