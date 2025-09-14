import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { router } from '@inertiajs/react';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
import { UserService } from '../services/userService';

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

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];

    // Debug: Log authentication status on Dashboard load
    useEffect(() => {
        console.log('Dashboard loaded. Auth status:', UserService.isLoggedIn());
        console.log('Current user:', UserService.getCurrentUser());
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        console.log('🚀 Navigation requested to:', path);
        console.log('🔐 User logged in?', UserService.isLoggedIn());
        console.log('👤 Current user:', UserService.getCurrentUser());
        
        try {
            router.visit(path);
            console.log('✅ Navigation request sent successfully');
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            alert('Navigation failed: ' + error);
        }
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
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
                activeMenu="dashboard"
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        {/* Sidebar Toggle Button */}
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

                {/* Dashboard Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-[22px] font-normal text-black">{date}</p>
                        <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                        <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                    </div>

                    <h1 className="text-5xl font-bold text-black mb-8">Dashboard</h1>

                    {/* Navigation Test Section */}
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-yellow-800 mb-4">🧪 Navigation Test</h2>
                        <p className="text-yellow-700 mb-4">Test sidebar navigation by clicking these buttons. Check the console (F12) for debug info.</p>
                        
                        {/* Simple link test */}
                        <div className="mb-4 p-4 bg-white rounded border">
                            <h3 className="font-bold mb-2">🔗 Direct Link Test:</h3>
                            <a href="/search/student" className="text-blue-500 underline hover:text-blue-700">
                                Go to Student Search (Direct Link)
                            </a>
                        </div>

                        {/* Router test */}
                        <div className="mb-4 p-4 bg-white rounded border">
                            <h3 className="font-bold mb-2">⚡ Inertia Router Test:</h3>
                            <button 
                                onClick={() => {
                                    console.log('🚀 Testing simple router.visit');
                                    try {
                                        router.visit('/search/student');
                                        console.log('✅ router.visit called successfully');
                                    } catch (error) {
                                        console.error('❌ router.visit failed:', error);
                                        alert('Router failed: ' + error);
                                    }
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Go to Student Search (Router)
                            </button>
                        </div>

                        {/* Window location test */}
                        <div className="mb-4 p-4 bg-white rounded border">
                            <h3 className="font-bold mb-2">🌐 Window Location Test:</h3>
                            <button 
                                onClick={() => {
                                    console.log('🚀 Testing window.location');
                                    window.location.href = '/search/student';
                                }}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Go to Student Search (Window Location)
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => handleNavigation('/test')}
                                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                            >
                                🧪 Simple Test Page
                            </button>
                            <button 
                                onClick={() => handleNavigation('/search/student')}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                🎓 Student Search
                            </button>
                            <button 
                                onClick={() => handleNavigation('/search/employee')}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                💼 Employee Search
                            </button>
                            <button 
                                onClick={() => handleNavigation('/search/community')}
                                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                            >
                                👥 Community Search
                            </button>
                            <button 
                                onClick={() => handleNavigation('/inventory/dashboard')}
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                            >
                                📊 Inventory Dashboard
                            </button>
                            <button 
                                onClick={() => handleNavigation('/inventory/stocks')}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                📦 Inventory Stocks
                            </button>
                            <button 
                                onClick={() => handleNavigation('/Reports')}
                                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                            >
                                📋 Reports
                            </button>
                        </div>
                    </div>

                    <section className="mb-10">
                        <h2 className="text-2xl font-normal text-black mb-4">Current Consultations:</h2>
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
                                <p className="text-4xl font-bold text-[#A3386C] mr-4">0</p>
                                <p className="text-xl text-gray-700">Walk-in/Scheduled Consultation</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
                                <p className="text-4xl font-bold text-[#A3386C] mr-4">0</p>
                                <p className="text-xl text-gray-700">Referred Consultation</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-black mb-4">Recent Consultations:</h2>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-40 flex items-center justify-center text-gray-500 italic">
                            {/* This area can be populated with actual recent consultations data */}
                            No recent consultations to display.
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;