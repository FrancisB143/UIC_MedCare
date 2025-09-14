import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Sidebar from '../../components/Sidebar';
import { Menu } from 'lucide-react';
import { UserService } from '../../services/userService';

const Student: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(true);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    useEffect(() => {
        console.log('✅ Student page loaded successfully');
        console.log('🔐 User logged in?', UserService.isLoggedIn());
        console.log('👤 Current user:', UserService.getCurrentUser());
    }, []);

    const handleNavigation = (path: string): void => {
        console.log('🚀 Navigation from Student page to:', path);
        try {
            router.visit(path);
            console.log('✅ Navigation request sent successfully');
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            alert('Navigation failed: ' + error);
        }
    };

    const handleLogout = (): void => {
        UserService.clearUserSession();
        router.visit('/');
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
                activeMenu="search"
            />

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">Student Search</h1>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4">Student Search</h2>
                        <p className="text-gray-600 mb-4">Search for student medical records and information.</p>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h3 className="text-green-800 font-medium">✅ Navigation Successful!</h3>
                            <p className="text-green-600 text-sm">You successfully navigated to the Student Search page.</p>
                        </div>

                        {/* Test Navigation Buttons */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-blue-800 font-medium mb-2">🧪 Test Navigation</h3>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => handleNavigation('/dashboard')}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Go to Dashboard
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/search/employee')}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Go to Employee Search
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/inventory/stocks')}
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                >
                                    Go to Inventory Stocks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student;