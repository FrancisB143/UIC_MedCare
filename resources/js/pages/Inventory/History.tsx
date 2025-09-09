import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { supabase } from '../../lib/supabaseClient';
import { UserService } from '../../services/userService';
import {
    History as HistoryIcon,
    Search,
    Menu,
    Plus,
    Minus,
    Package,
    Trash2
} from 'lucide-react';

interface HistoryLogEntry {
    history_id: number;
    user_id: number;
    medicine_stock_out_id?: number;
    medicine_deleted_id?: number;
    logged_at: string;
    // Joined data
    user_name?: string;
    medicine_name?: string;
    quantity?: number;
    activity_type: 'stock_out' | 'medicine_deleted';
    description?: string;
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
    const [sortBy, setSortBy] = useState('date');
    const [historyLogs, setHistoryLogs] = useState<HistoryLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Load current user
    useEffect(() => {
        const user = UserService.getCurrentUser();
        if (!user) {
            router.visit('/');
            return;
        }
        setCurrentUser(user);
    }, []);

    // Load history data from database
    const loadHistoryData = async () => {
        try {
            setIsLoading(true);
            
            if (!currentUser) return;

            console.log('Loading history data from database...');

            // Load history logs with related data
            const { data: historyData, error: historyError } = await supabase
                .from('history_log')
                .select(`
                    history_id,
                    user_id,
                    medicine_stock_out_id,
                    medicine_deleted_id,
                    logged_at
                `)
                .eq('user_id', currentUser.user_id)
                .order('logged_at', { ascending: false });

            if (historyError) {
                console.error('Error loading history data:', historyError);
                return;
            }

            console.log('Raw history data:', historyData);

            // Process each history entry to get additional details
            const processedHistory: HistoryLogEntry[] = [];

            for (const log of historyData || []) {
                let activityData: any = {
                    ...log,
                    user_name: currentUser.name || 'Unknown User'
                };

                if (log.medicine_stock_out_id) {
                    // Get stock out details
                    const { data: stockOutData } = await supabase
                        .from('medicine_stock_out')
                        .select(`
                            quantity_dispensed,
                            medicine_stock_in_id
                        `)
                        .eq('medicine_stock_out_id', log.medicine_stock_out_id)
                        .single();

                    if (stockOutData) {
                        // Get medicine details separately
                        const { data: stockInData } = await supabase
                            .from('medicine_stock_in')
                            .select(`
                                medicine_id,
                                medicines (
                                    medicine_name,
                                    medicine_category
                                )
                            `)
                            .eq('medicine_stock_in_id', stockOutData.medicine_stock_in_id)
                            .single();

                        activityData.activity_type = 'stock_out';
                        activityData.quantity = stockOutData.quantity_dispensed;
                        activityData.medicine_name = (stockInData?.medicines as any)?.medicine_name;
                        activityData.description = 'Medicine dispensed from inventory';
                    }
                } else if (log.medicine_deleted_id) {
                    // Get deleted medicine details
                    const { data: deletedData } = await supabase
                        .from('medicine_deleted')
                        .select(`
                            quantity,
                            description,
                            medicine_stock_in_id
                        `)
                        .eq('medicine_deleted_id', log.medicine_deleted_id)
                        .single();

                    if (deletedData) {
                        // Get medicine details separately
                        const { data: stockInData } = await supabase
                            .from('medicine_stock_in')
                            .select(`
                                medicine_id,
                                medicines (
                                    medicine_name,
                                    medicine_category
                                )
                            `)
                            .eq('medicine_stock_in_id', deletedData.medicine_stock_in_id)
                            .single();

                        activityData.activity_type = 'medicine_deleted';
                        activityData.quantity = deletedData.quantity;
                        activityData.medicine_name = (stockInData?.medicines as any)?.medicine_name;
                        activityData.description = deletedData.description;
                    }
                }

                processedHistory.push(activityData);
            }

            console.log('Processed history:', processedHistory);
            setHistoryLogs(processedHistory);

        } catch (error) {
            console.error('Error loading history data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            loadHistoryData();
        }
    }, [currentUser]);

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

    // Filter and sort the history logs
    const getFilteredAndSortedHistory = () => {
        let filtered = historyLogs.filter(entry =>
            entry.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === 'date') {
            filtered = filtered.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
        } else if (sortBy === 'medicine') {
            filtered = filtered.sort((a, b) => (a.medicine_name || '').localeCompare(b.medicine_name || ''));
        } else if (sortBy === 'quantity') {
            filtered = filtered.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        } else if (sortBy === 'activity') {
            filtered = filtered.sort((a, b) => a.activity_type.localeCompare(b.activity_type));
        }

        return filtered;
    };

    // Get activity icon and color
    const getActivityIcon = (activityType: string) => {
        switch (activityType) {
            case 'stock_out':
                return <Minus className="w-4 h-4 text-red-600" />;
            case 'medicine_deleted':
                return <Trash2 className="w-4 h-4 text-red-800" />;
            default:
                return <Package className="w-4 h-4 text-blue-600" />;
        }
    };

    // Get activity label
    const getActivityLabel = (activityType: string) => {
        switch (activityType) {
            case 'stock_out':
                return 'Dispensed';
            case 'medicine_deleted':
                return 'Removed';
            default:
                return 'Unknown';
        }
    };

    // Get activity color class
    const getActivityColorClass = (activityType: string) => {
        switch (activityType) {
            case 'stock_out':
                return 'bg-red-100 text-red-800';
            case 'medicine_deleted':
                return 'bg-red-200 text-red-900';
            default:
                return 'bg-blue-100 text-blue-800';
        }
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
                        <h2 className="text-2xl font-normal text-black">Activity History</h2>
                        <p className="text-gray-600 text-sm">Your medicine inventory activities - dispense and removal records</p>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex items-center justify-end mb-6">
                        <div className="relative mr-4">
                            <select 
                                value={sortBy}
                                onChange={handleSortChange}
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#A3386C] focus:border-[#A3386C] text-black bg-white"
                            >
                                <option value="date">Date (Newest First)</option>
                                <option value="medicine">Medicine Name (A-Z)</option>
                                <option value="quantity">Quantity (High to Low)</option>
                                <option value="activity">Activity Type</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search Medicine or Activity"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] focus:border-transparent text-sm text-black placeholder-gray-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-gray-500">Loading activity history...</div>
                        </div>
                    )}

                    {/* History Table */}
                    {!isLoading && (
                        <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F9E7F0] text-black">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">DATE & TIME</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">ACTIVITY</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">MEDICINE NAME</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">QUANTITY</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">DESCRIPTION</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getFilteredAndSortedHistory().map((entry: HistoryLogEntry, index: number) => (
                                        <tr key={entry.history_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>
                                                    <div className="font-medium">
                                                        {new Date(entry.logged_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(entry.logged_at).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActivityColorClass(entry.activity_type)}`}>
                                                    {getActivityIcon(entry.activity_type)}
                                                    <span className="ml-2">{getActivityLabel(entry.activity_type)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.medicine_name || 'Unknown Medicine'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.quantity ? `${entry.quantity} units` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {entry.description || 'No description available'}
                                            </td>
                                        </tr>
                                    ))}
                                    {getFilteredAndSortedHistory().length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                {isLoading ? 'Loading your activities...' : 'No activity history found matching your search criteria.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default History;