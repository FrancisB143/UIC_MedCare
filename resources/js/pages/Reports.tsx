import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';

interface DateTimeData {
    date: string;
    time: string;
}

function getCurrentDateTime(): DateTimeData {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    return { date, time };
}

const allChartData = {
    'March 2025': [
        { name: 'Ibuprofen', value: 20, color: '#A855F7' },
        { name: 'Paracetamol', value: 60, color: '#3B82F6' },
        { name: 'Decolgen', value: 30, color: '#F97316' },
        { name: 'Aspirin', value: 45, color: '#10B981' },
        { name: 'Amoxicillin', value: 15, color: '#F59E0B' }
    ],
    'April 2025': [
        { name: 'Ibuprofen', value: 35, color: '#A855F7' },
        { name: 'Paracetamol', value: 50, color: '#3B82F6' },
        { name: 'Decolgen', value: 25, color: '#F97316' },
        { name: 'Aspirin', value: 55, color: '#10B981' },
        { name: 'Amoxicillin', value: 20, color: '#F59E0B' }
    ],
    'May 2025': [
        { name: 'Ibuprofen', value: 10, color: '#A855F7' },
        { name: 'Paracetamol', value: 75, color: '#3B82F6' },
        { name: 'Decolgen', value: 40, color: '#F97316' },
        { name: 'Aspirin', value: 30, color: '#10B981' },
        { name: 'Amoxicillin', value: 25, color: '#F59E0B' }
    ]
};

type MonthYear = keyof typeof allChartData;

const commonMedicines = [
    { id: 1, name: 'RITEMED Paracetamol 500mg x 20 tablets', image: 'https://placehold.co/60x40/3B82F6/FFFFFF?text=P' },
    { id: 2, name: 'Decolgen Forte 25mg / 2mg / 500mg', image: 'https://placehold.co/60x40/F97316/FFFFFF?text=D' },
    { id: 3, name: 'MEDICOL Ibuprofen 200mg', image: 'https://placehold.co/60x40/A855F7/FFFFFF?text=I' },
    { id: 4, name: 'Generic Aspirin 81mg', image: 'https://placehold.co/60x40/10B981/FFFFFF?text=A' },
    { id: 5, name: 'Amoxicillin 500mg Capsules', image: 'https://placehold.co/60x40/F59E0B/FFFFFF?text=A' }
];

const Reports: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [selectedMonthYear, setSelectedMonthYear] = useState<MonthYear>('March 2025');

    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

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

    const chartData = allChartData[selectedMonthYear] || [];
    const { date, time } = dateTime;

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
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
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
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-[22px] font-normal text-black">{date}</p>
                        <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                        <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-2xl font-normal text-black mb-6">Overview</h3>
                                <div className="mb-4">
                                    <p className="text-gray-700 font-medium">Dispensed Medicine</p>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-2">Used Medicine</p>
                                    <select
                                        value={selectedMonthYear}
                                        onChange={(e) => setSelectedMonthYear(e.target.value as MonthYear)}
                                        // --- MODIFIED LINE START ---
                                        className="text-xl font-normal text-black bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                        // --- MODIFIED LINE END ---
                                        aria-label="Select month and year for chart data"
                                    >
                                        {Object.keys(allChartData).map(monthYear => (
                                            <option key={monthYear} value={monthYear}>
                                                {monthYear}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="h-72 mb-6 relative">
                                    <svg className="w-full h-full" viewBox="0 0 400 300">
                                        <defs>
                                            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                                                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3"/>
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                        <text x="25" y="250" textAnchor="middle" className="text-xs fill-gray-500">0</text>
                                        <text x="25" y="200" textAnchor="middle" className="text-xs fill-gray-500">25</text>
                                        <text x="25" y="150" textAnchor="middle" className="text-xs fill-gray-500">50</text>
                                        <text x="25" y="100" textAnchor="middle" className="text-xs fill-gray-500">75</text>
                                        <text x="25" y="50" textAnchor="middle" className="text-xs fill-gray-500">100</text>
                                        {chartData.map((item, index) => {
                                            const barWidth = 40;
                                            const barSpacing = 68;
                                            const startX = 60 + (index * barSpacing);
                                            const barHeight = (item.value / 100) * 200;
                                            const barY = 250 - barHeight;
                                            return (
                                                <g key={index}>
                                                    <rect x={startX} y={barY} width={barWidth} height={barHeight} fill={item.color} rx="4" ry="4" className="hover:opacity-80 transition-opacity cursor-pointer" />
                                                    <text x={startX + barWidth/2} y="270" textAnchor="middle" className="text-xs fill-gray-500" >
                                                        {item.name}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-3">
                                    {chartData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-xl font-normal text-black mb-6">Commonly Used Medicine</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Products</p>
                                </div>
                                <div className="space-y-4">
                                    {commonMedicines.map((medicine) => (
                                        <div key={medicine.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <img
                                                src={medicine.image}
                                                alt={medicine.name}
                                                className="w-16 h-12 object-cover rounded border flex-shrink-0"
                                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/60x40/cccccc/FFFFFF?text=Error'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 leading-snug">
                                                    {medicine.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
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