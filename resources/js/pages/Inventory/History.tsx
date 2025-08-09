import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar'; // <-- Import Sidebar
import { router } from '@inertiajs/react';
import {
    History as HistoryIcon,
    Search,
    Menu
} from 'lucide-react';

interface HistoryEntry {
    dateRemoved: string;
    medicineName: string;
    quantity: number;
    reasonForRemoval: string;
}

interface DateTimeData {
    date: string;
    time: string;
}

function getCurrentDateTime(): DateTimeData {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    return { date, time };
}

const History: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Dummy Data for Inventory History
    const inventoryHistory: HistoryEntry[] = [
        {
            dateRemoved: "2025-04-30",
            medicineName: "RITEMED Paracetamol 500mg",
            quantity: 100,
            reasonForRemoval: "Removed from the inventory due to expiration.",
        },
        {
            dateRemoved: "2025-03-30",
            medicineName: "RITEMED Cetirizine 10mg",
            quantity: 20,
            reasonForRemoval: "Removed from inventory as the medicine is no longer in production.",
        },
        {
            dateRemoved: "2025-05-15",
            medicineName: "RITEMED Ibuprofen 400mg",
            quantity: 50,
            reasonForRemoval: "Damaged packaging during transport.",
        },
    ];

    // Notifications Data
    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    // Filter and sort the inventory history
    const getFilteredAndSortedHistory = () => {
        let filtered = inventoryHistory.filter(entry =>
            entry.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.reasonForRemoval.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === 'date') {
            filtered = filtered.sort((a, b) => new Date(b.dateRemoved).getTime() - new Date(a.dateRemoved).getTime());
        } else if (sortBy === 'medicine') {
            filtered = filtered.sort((a, b) => a.medicineName.localeCompare(b.medicineName));
        } else if (sortBy === 'quantity') {
            filtered = filtered.sort((a, b) => b.quantity - a.quantity);
        }

        return filtered;
    };

    const { date, time } = dateTime;

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-history" // <-- Highlight Inventory > History
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        {/* Notification Bell */}
                        <NotificationBell
                            notifications={notifications}
                            onSeeAll={() => handleNavigation('../Notification')}
                        />
                    </div>
                </header>

                {/* Main History Container */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    {/* Date and Time */}
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-[22px] font-normal text-black">{date}</p>
                        <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                        <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                    </div>

                    {/* Page Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-normal text-black">Inventory History</h2>
                        <p className="text-gray-600 text-sm">Fr Selga, Davao City, Philippines</p>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex items-center justify-end mb-6">
                        <div className="relative mr-4">
                            <select 
                                value={sortBy}
                                onChange={handleSortChange}
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#A3386C] focus:border-[#A3386C] text-black bg-white"
                            >
                                <option value="">Sort by</option>
                                <option value="date">Date (Newest First)</option>
                                <option value="medicine">Medicine Name (A-Z)</option>
                                <option value="quantity">Quantity (High to Low)</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search Medicine"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] focus:border-transparent text-sm text-black placeholder-gray-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#D4A5B8] text-black">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">DATE REMOVED</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">MEDICINE NAME</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">QUANTITY</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">REASON FOR REMOVAL</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getFilteredAndSortedHistory().map((entry, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(entry.dateRemoved).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.medicineName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{entry.reasonForRemoval}</td>
                                    </tr>
                                ))}
                                {getFilteredAndSortedHistory().length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                            No history entries found matching your search criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default History;