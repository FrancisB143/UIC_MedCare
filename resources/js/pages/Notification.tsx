import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Menu, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';
import { BranchInventoryService } from '../services/branchInventoryService';

// A more detailed interface for the full notification page
interface FullNotification {
    id: number | string;
    title: string;
    message: string;
    time: string;
    // In a real app, you might have an image URL or an icon component
    icon: React.ReactNode; 
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


const Notification: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bellNotifications, setBellNotifications] = useState<NotificationType[]>([]);
    const [fullNotifications, setFullNotifications] = useState<FullNotification[]>([]);

    // Check for low stock medicines by calling backend API
    const checkLowStockMedicines = async () => {
        try {
            setIsLoading(true);
            const currentUser = UserService.getCurrentUser();
            if (!currentUser || !currentUser.branch_id) return [];
            const low = await BranchInventoryService.getLowStockMedicinesMSSQL(currentUser.branch_id).catch(() => []);
            return Array.isArray(low) ? low : [];

        } catch (error) {
            console.error('Error checking low stock medicines:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Close dropdowns on mount and load notifications from backend
    useEffect(() => {
        setSearchOpen(false);
        setInventoryOpen(false);

        const loadAll = async () => {
            const currentUser = UserService.getCurrentUser();
            if (!currentUser || !currentUser.branch_id) return;
            const branchId = currentUser.branch_id;

            // fetch low stock medicines from backend
            const lowStock = await checkLowStockMedicines().catch(() => []);
            setLowStockMedicines(lowStock);

            // fetch notifications for bell/full page
            const rows = await BranchInventoryService.getNotifications(branchId).catch(() => []);
            const bellNotifs = (rows || []).map((r: any) => ({
                id: r.notification_id ?? r.id ?? Math.random().toString(36).slice(2),
                type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' ? 'request' : 'info')) as any,
                message: r.message ?? '',
                isRead: !!r.is_read,
                createdAt: r.created_at ?? new Date().toISOString(),
                requestId: r.request_id ?? undefined,
                requestStatus: r.request_status ?? undefined,
            })) as NotificationType[];
            setBellNotifications(bellNotifs);

            // Build fullNotifications for the main page using the same data but with icons and titles
            const full = (bellNotifs || []).map(n => {
                let icon: React.ReactNode;
                let title = 'Notification';
                if (n.type === 'warning') { title = 'Low Stock Alert'; icon = <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-600" /></div>; }
                else if (n.type === 'success') { title = 'Success'; icon = <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center" />; }
                else if (n.type === 'request') { title = 'Branch Request'; icon = <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center" />; }
                else { title = 'Notification'; icon = <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-gray-600" /></div>; }

                return {
                    id: n.id,
                    title,
                    message: n.message,
                    time: new Date(n.createdAt).toLocaleDateString(),
                    icon
                } as FullNotification;
            });
            setFullNotifications(full);

            // Additionally, fetch pending branch requests so they can be displayed as well
            const pending = await BranchInventoryService.getPendingBranchRequests(branchId).catch(() => []);
            if (Array.isArray(pending) && pending.length > 0) {
                const pendingNotifs = pending.map((p: any) => ({
                    id: `req-${p.branch_request_id}`,
                    title: 'Branch Request',
                    message: `${p.requesting_branch_name ?? `Branch ${p.from_branch_id}`} requested ${p.quantity} of ${p.medicine_name}`,
                    time: new Date(p.created_at ?? Date.now()).toLocaleDateString(),
                    icon: <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center" />
                } as FullNotification));

                setFullNotifications(prev => [...pendingNotifs, ...prev]);
            }
        };

        loadAll();
    }, []);

    // loadNotifications is handled by the useEffect above which queries the backend

    // Mark notifications as read: call backend and clear bell notifications
    const markNotificationsAsRead = async () => {
        try {
            const currentUser = UserService.getCurrentUser();
            if (!currentUser || !currentUser.branch_id) return;
            await BranchInventoryService.markNotificationsRead(currentUser.branch_id).catch(() => {});
            setBellNotifications([]);
        } catch (err) {
            console.error('Error marking notifications read', err);
        }
    };

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
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

    const { date, time } = dateTime;

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
                activeMenu=""
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
                            notifications={bellNotifications}
                            onSeeAll={() => handleNavigation('/notification')}
                            onMarkAsRead={markNotificationsAsRead}
                        />
                    </div>
                </header>

                {/* Main Notification Container */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Notification</h2>
                        <p className="text-gray-500 mt-1">Get notification what's the recent transaction</p>
                    </div>

                    {/* Notification List */}
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-4">
                            {fullNotifications.length > 0 ? (
                                fullNotifications.map(notification => (
                                    <div key={notification.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {notification.icon}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-md font-semibold text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 whitespace-nowrap">{notification.time}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No notifications to display.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Notification;