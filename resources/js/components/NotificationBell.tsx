import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';

export interface Notification {
    id: number | string;
    type: 'info' | 'warning' | 'success' | 'error';
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface LowStockMedicine {
    medicine_id: number;
    medicine_name: string;
    quantity: number;
    medicine_category?: string;
}

interface NotificationBellProps {
    notifications: Notification[];
    lowStockMedicines?: LowStockMedicine[];
    onSeeAll?: () => void;
    onMarkAsRead?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, lowStockMedicines = [], onSeeAll, onMarkAsRead }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [showLowStockAlert, setShowLowStockAlert] = useState(false);
    const [alertShownBefore, setAlertShownBefore] = useState(false);
    const [lowStockNotificationsCreated, setLowStockNotificationsCreated] = useState(false);

    // Generate low stock notifications from lowStockMedicines
    const generateLowStockNotifications = (): Notification[] => {
        if (lowStockMedicines.length === 0 || lowStockNotificationsCreated) return [];
        
        const currentTime = new Date().toISOString();
        return lowStockMedicines.map((medicine, index) => ({
            id: `low-stock-${medicine.medicine_id}`,
            type: 'warning' as const,
            message: `Low Stock Alert: ${medicine.medicine_name} has only ${medicine.quantity} units remaining`,
            isRead: false,
            createdAt: currentTime
        }));
    };

    // Combine original notifications with low stock notifications
    const allNotifications = [...notifications, ...generateLowStockNotifications()];

    // Auto-show low stock alert when there are medicines with 50 or below units
    useEffect(() => {
        const hasLowStock = lowStockMedicines.length > 0;
        
        if (hasLowStock && !alertShownBefore) {
            setShowLowStockAlert(true);
            setAlertShownBefore(true);
            setLowStockNotificationsCreated(true);
            
            // Auto close after 3 seconds
            const timer = setTimeout(() => {
                setShowLowStockAlert(false);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [lowStockMedicines, alertShownBefore]);

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
        
        // Mark notifications as read when bell is clicked
        if (!isNotificationOpen && allNotifications.length > 0 && onMarkAsRead) {
            onMarkAsRead();
        }
    };

    const closeLowStockAlert = () => {
        setShowLowStockAlert(false);
    };

    // Show only first 2 notifications in the bell, rest go to notification page
    const displayedNotifications = allNotifications.slice(0, 2);
    const hasMoreNotifications = allNotifications.length > 2;

    return (
        <div className="relative">
            {/* Low Stock Alert Popup */}
            {showLowStockAlert && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800 mb-1">
                                Low Stock Alert!
                            </h3>
                            <p className="text-sm text-red-700 mb-2">
                                {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} need{lowStockMedicines.length === 1 ? 's' : ''} reordering (≤50 units)
                            </p>
                            <div className="max-h-20 overflow-y-auto">
                                {lowStockMedicines.slice(0, 3).map(medicine => (
                                    <div key={medicine.medicine_id} className="text-xs text-red-600 mb-1">
                                        • {medicine.medicine_name}: {medicine.quantity} units
                                    </div>
                                ))}
                                {lowStockMedicines.length > 3 && (
                                    <div className="text-xs text-red-600">
                                        ... and {lowStockMedicines.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={closeLowStockAlert}
                            className="flex-shrink-0 ml-2 text-red-400 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bell icon with notification count */}
            <div className="relative">
                <Bell className="w-6 h-6 text-white cursor-pointer" onClick={toggleNotification} />
                {allNotifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {allNotifications.length > 9 ? '9+' : allNotifications.length}
                    </span>
                )}
            </div>
            <div
                className={`
                    absolute right-0 mt-2 w-100 bg-white rounded-lg shadow-lg z-30
                    transition-all duration-300 ease-in-out
                    ${isNotificationOpen
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}
                `}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Notification History</h3>
                        {onSeeAll && (
                            <button className="text-sm text-[#A3386C] hover:underline" onClick={() => onSeeAll && onSeeAll()}>See All</button>
                        )}
                    </div>
                    {allNotifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">No new notifications.</p>
                    ) : (
                        <div className="space-y-3">
                            {displayedNotifications.map(notification => (
                                <div key={notification.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                                    {notification.type === 'warning' && (
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                    )}
                                    {notification.type === 'info' && (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                            <img src="/images/medicine.jpg" alt="Medicine Icon" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    {notification.type === 'success' && (
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                            <img src="/images/nurse.jpg" alt="Request Icon" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    {notification.type === 'error' && (
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {hasMoreNotifications && (
                                <div className="border-t pt-3 mt-3">
                                    <p className="text-xs text-gray-500 text-center">
                                        {allNotifications.length - 2} more notifications...
                                    </p>
                                    {onSeeAll && (
                                        <button 
                                            className="w-full text-sm text-[#A3386C] hover:underline mt-1" 
                                            onClick={() => onSeeAll()}
                                        >
                                            View All Notifications
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;
