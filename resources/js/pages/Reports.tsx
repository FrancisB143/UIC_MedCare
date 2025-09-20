import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { router } from '@inertiajs/react';
import { Menu, Printer } from 'lucide-react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';

// Add print-specific styles to the head
const printStyles = `
@media print {
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

// Chart data will be fetched from the backend (medicines table: name, medicine_stock_out)
type MedicineData = {
    name: string;
    medicine_stock_out: number;
    color?: string;
    percent?: number;
    category?: string;
}

// Placeholder images for items without image
const placeholderImage = (initial: string) => `https://placehold.co/60x40/9CA3AF/FFFFFF?text=${encodeURIComponent(initial)}`;

const Reports: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [chartData, setChartData] = useState<MedicineData[]>([]);
    const [loadingChart, setLoadingChart] = useState<boolean>(true);
    const [totalDispensed, setTotalDispensed] = useState<number>(0);

    const fallbackData: MedicineData[] = [{ name: 'No data', medicine_stock_out: 0, color: '#E5E7EB' }];

    // color palette to assign to medicines (will be used if DB color not provided)
    const colorPalette = ['#3B82F6','#F97316','#A855F7','#10B981','#F59E0B','#EF4444','#6366F1','#06B6D4','#F472B6','#84CC16'];

    // Dummy data for the notification bell
    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];

    // Navigation and logout handlers
    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handlePrintReport = () => {
        console.log(`Preparing to print report...`);
        window.print();
    };

    useEffect(() => {
        // fetch medicines stock-out data from backend
        const fetchData = async () => {
            setLoadingChart(true);
            try {
                const url = `${window.location.origin}/api/medicines/stock-out`;
                console.debug('Fetching medicine stock-out from', url);
                const res = await fetch(url, { credentials: 'same-origin' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                console.debug('Received chart data', data);
                // Expecting array of { name, medicine_stock_out, color? }
                const raw = data.map((d: any, i: number) => ({
                    name: d.name,
                    medicine_stock_out: Number(d.medicine_stock_out) || 0,
                    color: d.color || colorPalette[i % colorPalette.length],
                    category: d.category || d.medicine_category || d.medicineCategory || 'Uncategorized'
                }));

                const totalCount = raw.reduce((s: number, r: MedicineData) => s + r.medicine_stock_out, 0);

                // compute integer percentages that sum to 100
                let withPercents = raw.map((r: MedicineData) => ({ ...r as any, percent: 0 }));
                if (totalCount > 0) {
                    const floats: number[] = raw.map((r: MedicineData) => (r.medicine_stock_out / totalCount) * 100);
                    const floors: number[] = floats.map((f: number) => Math.floor(f));
                    let remainder = 100 - floors.reduce((a: number, b: number) => a + b, 0);
                    const fractions = floats.map((f: number, idx: number) => ({ idx, frac: f - Math.floor(f) })).sort((a: any, b: any) => b.frac - a.frac);
                    const percents = floors.slice();
                    for (let k = 0; k < remainder; k++) {
                        percents[fractions[k].idx] = (percents[fractions[k].idx] || 0) + 1;
                    }
                    withPercents = raw.map((r: MedicineData, idx: number) => ({ ...r as any, percent: percents[idx], medicine_stock_out: r.medicine_stock_out }));
                }
                setTotalDispensed(totalCount);
                setChartData(withPercents as any);
            } catch (err) {
                console.error('Failed to load chart data', err);
                setChartData([]);
            } finally {
                setLoadingChart(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="reports"
            />
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10 print:hidden">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        <NotificationBell notifications={notifications} onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>
                <main id="printable-area" className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-normal text-black">Overview</h3>
                                    <button
                                        onClick={handlePrintReport}
                                        className="bg-[#A3386C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8f2f5c] transition-colors flex items-center gap-2 print:hidden"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print Report
                                    </button>
                                </div>
                                <div className="mb-4">
                                    <p className="text-gray-700 font-medium">Dispensed Medicine: ({totalDispensed})</p>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-2">Used Medicine (Stock-Out)</p>
                                </div>
                                    <div className="h-72 mb-6 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} height={60} />
                                                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                                <Tooltip formatter={(value: any, name: any, props: any) => [`${value}%`, 'Percent']} />
                                                <Bar dataKey="percent" name="Percent" fill="#A3386C">
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || '#A3386C'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-3">
                                    {chartData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color || '#A3386C' }}></div>
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                            <span className="text-sm font-medium text-gray-900 ml-2">{item.percent ?? 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 print:hidden">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
                                <h3 className="text-xl font-normal text-black mb-6">Commonly Used Medicine</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Products</p>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-2">Used Medicine (Stock-Out)</p>
                                </div>

                                <div className="space-y-3">
                                    {chartData && chartData.length > 0 ? (
                                        // top 5 by raw stock-out count; fallback to percent sorting if same
                                        chartData
                                            .slice()
                                            .sort((a, b) => (b.medicine_stock_out - a.medicine_stock_out) || ((b.percent ?? 0) - (a.percent ?? 0)))
                                            .slice(0, 5)
                                            .map((m, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: m.color || colorPalette[idx % colorPalette.length] }}>
                                                        { (m.name || 'M').charAt(0) }
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{m.name}</div>
                                                        <div className="text-xs text-gray-500">{m.category ?? 'Uncategorized'}</div>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{m.percent ?? 0}%</div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-sm text-gray-500">No data</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
    </div>
    );
};

export default Reports;
