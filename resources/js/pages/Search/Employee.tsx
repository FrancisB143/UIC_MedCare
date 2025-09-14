import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Sidebar from '../../components/Sidebar';
import { Menu } from 'lucide-react';
import { UserService } from '../../services/userService';

const Employee: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(true);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    useEffect(() => {
        console.log('✅ Employee page loaded successfully');
    }, []);

    const handleNavigation = (path: string): void => {
        console.log('🚀 Navigation from Employee page to:', path);
        router.visit(path);
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

            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">Employee Search</h1>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4">Employee Search</h2>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-green-800 font-medium">✅ Navigation Successful!</h3>
                            <p className="text-green-600 text-sm">You successfully navigated to the Employee Search page.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Employee;