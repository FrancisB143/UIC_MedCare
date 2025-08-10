import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export interface Notification {
    id: number;
    type: 'updatedMedicine' | 'medicineRequest';
    message: string;
    time: string;
}

interface NotificationBellProps {
    notifications: Notification[];
    onSeeAll?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onSeeAll }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
    };

    return (
        <div className="relative">
            <Bell className="w-6 h-6 text-white cursor-pointer" onClick={toggleNotification} />
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
                            <button className="text-sm text-[#A3386C] hover:underline" onClick={onSeeAll}>See All</button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">No new notifications.</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(notification => (
                                <div key={notification.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                                    {notification.type === 'updatedMedicine' && (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                            <img src="/images/medicine.jpg" alt="Medicine Icon" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    {notification.type === 'medicineRequest' && (
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                            <img src="/images/nurse.jpg" alt="Request Icon" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;
