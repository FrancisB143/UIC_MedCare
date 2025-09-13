import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { UserService } from '../../services/userService';
import { NotificationService } from '../../services/notificationService';
import { BranchInventoryService, MedicineStockIn, MedicineStockOut, MedicineDeleted } from '../../services/branchInventoryService';
import { HistoryLogService, HistoryLog } from '../../services/HistoryLogService';
import {
    History as HistoryIcon,
    Search,
    Menu,
    Plus,
    Minus,
    Package,
    Trash2,
    RefreshCcw,
    Activity,
    Calendar,
    Clock,
    User
} from 'lucide-react';

interface ActivityEntry {
    id: string;
    type: 'reorder' | 'dispense' | 'remove' | 'add';
    medicine_name: string;
    quantity: number;
    description: string;
    timestamp: string;
    user_name: string;
}

function getCurrentDateTime() {
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

// Helper functions to extract data from history logs
function getMedicineNameFromHistoryLog(log: HistoryLog): string {
    // For ADD actions - medicine added to system (from medicines table)
    if (log.action_type === 'ADD' && log.medicine?.medicine_name) {
        return log.medicine.medicine_name;
    }
    // For REORDER actions - restocking inventory (from medicine_stock_in)
    if (log.medicine_stock_in?.medicine?.medicine_name) {
        return log.medicine_stock_in.medicine.medicine_name;
    }
    // For DISPENSE actions
    if (log.medicine_stock_out?.medicine?.medicine_name) {
        return log.medicine_stock_out.medicine.medicine_name;
    }
    // For REMOVE actions
    if (log.medicine_deleted?.medicine_name) {
        return log.medicine_deleted.medicine_name;
    }
    // For REORDER requests
    if (log.medicine_reorder?.medicine?.medicine_name) {
        return log.medicine_reorder.medicine.medicine_name;
    }
    return 'Unknown Medicine';
}

function getQuantityFromHistoryLog(log: HistoryLog): number {
    if (log.medicine_stock_in?.quantity) {
        return log.medicine_stock_in.quantity;
    }
    if (log.medicine_stock_out?.quantity_dispensed) {
        return log.medicine_stock_out.quantity_dispensed;
    }
    if (log.medicine_deleted?.quantity_deleted) {
        return log.medicine_deleted.quantity_deleted;
    }
    if (log.medicine_reorder?.quantity_requested) {
        return log.medicine_reorder.quantity_requested;
    }
    return 0;
}

const History: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    // Sample dummy notifications
    const dummyNotifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];

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

            console.log('Loading comprehensive activity history...');

            // First, load from new history_log system
            try {
                const logs = await HistoryLogService.getBranchHistoryLogs(currentUser.branch_id, 200);
                setHistoryLogs(logs);
                console.log('Loaded history logs:', logs.length);
            } catch (error) {
                console.warn('Failed to load history logs (table may not exist):', error);
                setHistoryLogs([]);
            }

            const activities: ActivityEntry[] = [];

            // Get stock in records (stock additions/reorders) for current user's branch
            const stockInRecords = await BranchInventoryService.getBranchStockInRecords(currentUser.branch_id);
            stockInRecords.forEach(record => {
                // Use timestamp_dispensed if available, otherwise fall back to date_received
                const activityTimestamp = (record as any).timestamp_dispensed || record.date_received;
                
                activities.push({
                    id: `stock_in_${record.medicine_stock_in_id}`,
                    type: 'reorder', // This is actually restocking/reordering existing medicines
                    medicine_name: record.medicine?.medicine_name || 'Unknown Medicine',
                    quantity: record.quantity,
                    description: `Medicine restocked`,
                    timestamp: activityTimestamp,
                    user_name: record.user?.name || 'Unknown User'
                });
            });

            // Get stock out records (dispensed) for current user's branch
            const stockOutRecords = await BranchInventoryService.getBranchStockOutRecords(currentUser.branch_id);
            stockOutRecords.forEach(record => {
                activities.push({
                    id: `stock_out_${record.medicine_stock_out_id}`,
                    type: 'dispense',
                    medicine_name: record.medicine_stock_in?.medicine?.medicine_name || 'Unknown Medicine',
                    quantity: record.quantity_dispensed,
                    description: 'Medicine dispensed',
                    timestamp: record.timestamp_dispensed,
                    user_name: record.user?.name || 'Unknown User'
                });
            });

            // Get deleted medicine records for current user's branch
            const deletedRecords = await BranchInventoryService.getDeletedMedicineRecords(currentUser.branch_id);
            deletedRecords.forEach(record => {
                activities.push({
                    id: `deleted_${record.medicine_deleted_id}`,
                    type: 'remove',
                    medicine_name: record.medicine_stock_in?.medicine?.medicine_name || 'Unknown Medicine',
                    quantity: record.quantity,
                    description: record.description || 'Medicine removed',
                    timestamp: record.deleted_at,
                    user_name: record.user?.name || 'Unknown User' // Now shows actual user who deleted
                });
            });

            // Sort by timestamp (newest first)
            activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            console.log('Loaded activities:', activities);
            setActivities(activities);

        } catch (error) {
            console.error('Error loading history data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            loadHistoryData();
            loadNotifications();
        }
    }, [currentUser]);

    // Load notifications from localStorage and dummy data
    const loadNotifications = () => {
        const localNotifications = NotificationService.loadNotifications();
        const allNotifications = [...dummyNotifications, ...localNotifications];
        setNotifications(allNotifications);
    };

    // Mark notifications as read
    const markNotificationsAsRead = () => {
        NotificationService.markAllAsRead();
        setNotifications([]);
    };

    // Filter and sort the activities (including history logs)
    const getFilteredAndSortedActivities = () => {
        // Combine legacy activities and new history logs
        const combinedActivities: ActivityEntry[] = [...activities];

        // Convert history logs to activity entries
        historyLogs.forEach(log => {
            const medicineName = getMedicineNameFromHistoryLog(log);
            const quantity = getQuantityFromHistoryLog(log);

            combinedActivities.push({
                id: `history_log_${log.history_id}`,
                type: log.action_type.toLowerCase() as 'add' | 'dispense' | 'remove' | 'reorder',
                medicine_name: medicineName,
                quantity: quantity,
                description: log.description,
                timestamp: log.logged_at,
                user_name: log.user?.name || 'Unknown User'
            });
        });

        let filtered = combinedActivities.filter(entry =>
            entry.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.user_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === 'date') {
            filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else if (sortBy === 'medicine') {
            filtered = filtered.sort((a, b) => a.medicine_name.localeCompare(b.medicine_name));
        } else if (sortBy === 'quantity') {
            filtered = filtered.sort((a, b) => b.quantity - a.quantity);
        } else if (sortBy === 'activity') {
            filtered = filtered.sort((a, b) => a.type.localeCompare(b.type));
        }

        return filtered;
    };

    // Get activity icon and color
    const getActivityIcon = (activityType: string) => {
        switch (activityType) {
            case 'dispense':
                return <Minus className="w-4 h-4 text-blue-600" />;
            case 'remove':
                return <Trash2 className="w-4 h-4 text-red-600" />;
            case 'reorder':
                return <RefreshCcw className="w-4 h-4 text-orange-600" />;
            case 'add':
                return <Plus className="w-4 h-4 text-green-600" />;
            default:
                return <Package className="w-4 h-4 text-gray-600" />;
        }
    };

    // Get activity label
    const getActivityLabel = (activityType: string) => {
        switch (activityType) {
            case 'dispense':
                return 'Dispensed';
            case 'remove':
                return 'Removed';
            case 'reorder':
                return 'Restocked';
            case 'add':
                return 'Added';
            default:
                return 'Unknown';
        }
    };

    // Get activity color class
    const getActivityColorClass = (activityType: string) => {
        switch (activityType) {
            case 'dispense':
                return 'bg-blue-100 text-blue-800';
            case 'remove':
                return 'bg-red-100 text-red-800';
            case 'reorder':
                return 'bg-orange-100 text-orange-800';
            case 'add':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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
                            onMarkAsRead={markNotificationsAsRead}
                        />
                    </div>
                </header>

                {/* Main History Container */}
                <main className="flex-1 flex flex-col p-6 overflow-hidden bg-white">
                    {/* Activity Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Plus className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-green-800">Added</h3>
                                    <p className="text-2xl font-bold text-green-900">
                                        {historyLogs.filter(h => h.action_type === 'ADD').length}
                                    </p>
                                    <p className="text-sm text-green-600">New medicines added to system</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <RefreshCcw className="w-8 h-8 text-orange-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-orange-800">Restocked</h3>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {activities.filter(a => a.type === 'reorder').length + 
                                         historyLogs.filter(h => h.action_type === 'REORDER').length}
                                    </p>
                                    <p className="text-sm text-orange-600">Medicine inventory restocked</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Minus className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-blue-800">Dispensed</h3>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {activities.filter(a => a.type === 'dispense').length + 
                                         historyLogs.filter(h => h.action_type === 'DISPENSE').length}
                                    </p>
                                    <p className="text-sm text-blue-600">Medicines dispensed to patients</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Trash2 className="w-8 h-8 text-red-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-red-800">Removed</h3>
                                    <p className="text-2xl font-bold text-red-900">
                                        {activities.filter(a => a.type === 'remove').length + 
                                         historyLogs.filter(h => h.action_type === 'REMOVE').length}
                                    </p>
                                    <p className="text-sm text-red-600">Medicines removed from inventory</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Title and Filters */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-normal text-black">Activity History</h2>
                            <p className="text-gray-600 text-sm">Complete inventory activity log - reorders, dispensing, and removals</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={loadHistoryData}
                                disabled={isLoading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#A3386C] disabled:opacity-50"
                            >
                                <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className="relative">
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
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-gray-500">Loading activity history...</div>
                        </div>
                    )}

                    {/* History Table */}
                    {!isLoading && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 flex-1 flex flex-col overflow-hidden">
                                {/* Table Header - Fixed */}
                                <div className="flex-shrink-0 border-b border-gray-200">
                                    <table className="min-w-full">
                                        <thead className="bg-[#F9E7F0] text-black">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/5">DATE & TIME</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/6">ACTIVITY</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/4">MEDICINE NAME</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/6">QUANTITY</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/3">DESCRIPTION</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                
                                {/* Table Body - Scrollable */}
                                <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <table className="min-w-full">
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {getFilteredAndSortedActivities().map((entry: ActivityEntry, index: number) => (
                                                <tr key={entry.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/5">
                                                        <div>
                                                            <div className="font-medium">
                                                                {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm w-1/6">
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActivityColorClass(entry.type)}`}>
                                                            {getActivityIcon(entry.type)}
                                                            <span className="ml-2">{getActivityLabel(entry.type)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/4">
                                                        <div className="truncate" title={entry.medicine_name}>
                                                            {entry.medicine_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/6">
                                                        <span className="font-medium">{entry.quantity}</span> units
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/3">
                                                        <div className="truncate" title={entry.description}>
                                                            {entry.description}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {getFilteredAndSortedActivities().length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <Package className="w-8 h-8 text-gray-400" />
                                                            <span>{isLoading ? 'Loading your activities...' : 'No activity history found matching your search criteria.'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Optional: Scroll indicator */}
                                <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                    Showing {getFilteredAndSortedActivities().length} of {activities.length} activities
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default History;