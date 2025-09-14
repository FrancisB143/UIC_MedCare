import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Menu, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { supabase } from '../lib/supabaseClient';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';

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

    // Sample dummy notifications similar to notification bell
    const dummyNotifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];

    // Initialize with dummy notifications on component mount
    useEffect(() => {
        // Create initial dummy notifications for display
        const initialDummy: FullNotification[] = dummyNotifications.map(notif => {
            let icon;
            let title;
            
            switch(notif.type) {
                case 'info':
                    icon = (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            <img src="/images/medicine.jpg" alt="Medicine Icon" className="w-full h-full object-cover" />
                        </div>
                    );
                    title = 'Medicine Update';
                    break;
                case 'success':
                    icon = (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                            <img src="/images/nurse.jpg" alt="Request Icon" className="w-full h-full object-cover" />
                        </div>
                    );
                    title = 'Request Received';
                    break;
                default:
                    icon = (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-gray-600" />
                        </div>
                    );
                    title = 'Notification';
            }
            
            return {
                id: notif.id,
                title,
                message: notif.message,
                time: new Date(notif.createdAt).toLocaleDateString(),
                icon
            };
        });
        
        setFullNotifications(initialDummy);
    }, []);

    // Check for low stock medicines based on reorder levels
    const checkLowStockMedicines = async () => {
        try {
            setIsLoading(true);
            
            // TODO: Replace with MSSQL API call for stock levels
            // For now, return empty array to fix compilation errors
            console.log('Low stock checking temporarily disabled - needs MSSQL API integration');
            return [];

            /* Commented out until MSSQL API integration is complete
            // Get all current stock levels by summing quantities for each medicine
            const { data: stockRecords, error: stockError } = await supabase
                .from('medicine_stock_in')
                .select('medicine_id, quantity');

            if (stockError) {
                console.error('Error loading stock records:', stockError);
                return [];
            }

            // Calculate total quantities for each medicine
            const currentStockLevels = stockRecords?.reduce((acc: any, record: any) => {
                const medicineId = record.medicine_id;
                const quantity = record.quantity || 0;
                
                if (acc[medicineId]) {
                    acc[medicineId] += quantity;
                } else {
                    acc[medicineId] = quantity;
                }
                return acc;
            }, {} as Record<number, number>) || {};

            // Get reorder levels from medicine_reorder_levels table
            const { data: reorderLevels, error: reorderError } = await supabase
                .from('medicine_reorder_levels')
                .select(`
                    medicine_id,
                    minimum_stock_level,
                    medicines (
                        medicine_name
                    )
                `);

            if (reorderError) {
                console.error('Error loading reorder levels:', reorderError);
                return [];
            }

            // Find medicines that are below their reorder level
            const lowStockMedicines = [];
            for (const reorderLevel of reorderLevels || []) {
                const currentStock = currentStockLevels[reorderLevel.medicine_id] || 0;
                const minimumLevel = reorderLevel.minimum_stock_level || 50;
                
                if (currentStock <= minimumLevel) {
                    lowStockMedicines.push({
                        medicine_id: reorderLevel.medicine_id,
                        medicine_name: (reorderLevel.medicines as any)?.medicine_name,
                        current_stock: currentStock,
                        minimum_level: minimumLevel
                    });
                }
            }

            return lowStockMedicines;
            */
        } catch (error) {
            console.error('Error checking low stock medicines:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Close dropdowns on mount and load notifications
    useEffect(() => {
        setSearchOpen(false);
        setInventoryOpen(false);
        
        // Always load dummy notifications first
        loadNotifications();
        
        // Load low stock medicines
        checkLowStockMedicines().then(lowStock => {
            setLowStockMedicines(lowStock);
            // Reload notifications after low stock data is available
            setTimeout(() => loadNotifications(), 100);
        });
    }, []);

    // Generate low stock notifications from lowStockMedicines
    const generateLowStockNotifications = (): NotificationType[] => {
        if (lowStockMedicines.length === 0) return [];
        
        const currentTime = new Date().toISOString();
        return lowStockMedicines.map((medicine) => ({
            id: `low-stock-${medicine.medicine_id}`,
            type: 'warning' as const,
            message: `Low Stock Alert: ${medicine.medicine_name} has only ${medicine.current_stock} units remaining`,
            isRead: false,
            createdAt: currentTime
        }));
    };

    // Combine dummy notifications with low stock notifications
    const getAllNotifications = (): NotificationType[] => {
        const lowStockNotifs = generateLowStockNotifications();
        return [...dummyNotifications, ...lowStockNotifs];
    };

    // Load notifications from localStorage and dummy data
    const loadNotifications = () => {
        try {
            const allNotifications = getAllNotifications();
            setBellNotifications(allNotifications);
            
            // Create detailed notifications for the main page
            const detailed: FullNotification[] = allNotifications.map(notif => {
                let icon;
                let title;
                
                switch(notif.type) {
                    case 'warning':
                        icon = (
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        );
                        title = 'Low Stock Alert';
                        break;
                    case 'info':
                        icon = (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                                <img src="/images/medicine.jpg" alt="Medicine Icon" className="w-full h-full object-cover" />
                            </div>
                        );
                        title = 'Medicine Update';
                        break;
                    case 'success':
                        icon = (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                                <img src="/images/nurse.jpg" alt="Request Icon" className="w-full h-full object-cover" />
                            </div>
                        );
                        title = 'Request Received';
                        break;
                    default:
                        icon = (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-gray-600" />
                            </div>
                        );
                        title = 'Notification';
                }
                
                return {
                    id: notif.id,
                    title,
                    message: notif.message,
                    time: new Date(notif.createdAt).toLocaleDateString(),
                    icon
                };
            });
            
            setFullNotifications(detailed);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    // Mark notifications as read
    const markNotificationsAsRead = () => {
        setBellNotifications([]);
        // Keep dummy notifications visible in the main page
        const dummyDetailed: FullNotification[] = dummyNotifications.map(notif => {
            let icon;
            let title;
            
            switch(notif.type) {
                case 'info':
                    icon = (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            <img src="/images/medicine.jpg" alt="Medicine Icon" className="w-full h-full object-cover" />
                        </div>
                    );
                    title = 'Medicine Update';
                    break;
                case 'success':
                    icon = (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                            <img src="/images/nurse.jpg" alt="Request Icon" className="w-full h-full object-cover" />
                        </div>
                    );
                    title = 'Request Received';
                    break;
                default:
                    icon = (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-gray-600" />
                        </div>
                    );
                    title = 'Notification';
            }
            
            return {
                id: notif.id,
                title,
                message: notif.message,
                time: new Date(notif.createdAt).toLocaleDateString(),
                icon
            };
        });
        setFullNotifications(dummyDetailed);
    };

    useEffect(() => {
        // Load notifications when component mounts and when low stock data changes
        if (lowStockMedicines.length >= 0) { // Check for array (even if empty)
            loadNotifications();
        }
        
        // Update time every second
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, [lowStockMedicines]); // Add lowStockMedicines as dependency

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