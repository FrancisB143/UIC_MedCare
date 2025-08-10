import React, { useState } from 'react';
import {
    LayoutDashboard,
    Search,
    Archive,
    FileText,
    Printer,
    ShieldQuestion,
    History,
    GraduationCap,
    Briefcase,
    Users,
    ChevronDown,
    User,
    LogOut
} from 'lucide-react';
import LogoutModal from './LogoutModal';

interface SidebarProps {
    isSidebarOpen: boolean;
    isSearchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    isInventoryOpen: boolean;
    setInventoryOpen: (open: boolean) => void;
    handleNavigation: (path: string) => void;
    handleLogout: () => void;
    activeMenu: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    isSearchOpen,
    setSearchOpen,
    isInventoryOpen,
    setInventoryOpen,
    handleNavigation,
    handleLogout,
    activeMenu
}) => {
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

    return (
        <>
            <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Profile */}
                <div className="p-6 mt-4 border-b border-white/50">
                    <div className="flex flex-col items-center mb-2">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-[#A3386C]" />
                        </div>
                        <div className={`flex flex-col items-center transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-[20px] font-semibold">John Doe</p>
                            <p className="text-sm">Nurse</p>
                        </div>
                    </div>
                    <p className={`text-center text-xs transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Fr Selga, Davao City</p>
                </div>

                {/* Navigation */}
                <nav className="mt-8 flex-1 flex flex-col overflow-y-auto">
                    <div className="px-4 space-y-2">
                        {/* Dashboard */}
                        <div
                            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${activeMenu === 'dashboard' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                            onClick={() => handleNavigation('/')}
                        >
                            <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <p className="text-sm font-medium text-white ml-3 whitespace-nowrap">Dashboard</p>}
                        </div>

                        {/* Search Submenu */}
                        <div>
                            <div
                                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${activeMenu === 'search' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => setSearchOpen(!isSearchOpen)}
                            >
                                <Search className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && (
                                    <div className="flex justify-between w-full items-center">
                                        <p className="text-sm text-white ml-3 whitespace-nowrap">Search</p>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSearchOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                )}
                            </div>
                            <div
                                className={`
                                    overflow-hidden transition-all duration-300
                                    ${isSidebarOpen && isSearchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                {isSidebarOpen && (
                                    <div className="mt-1 space-y-1 pl-8">
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/student')}>
                                            <GraduationCap className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Student</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/employee')}>
                                            <Briefcase className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Employee</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/community')}>
                                            <Users className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Community</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inventory Submenu */}
                        <div>
                            <div
                                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${activeMenu === 'inventory' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                                onClick={() => setInventoryOpen(!isInventoryOpen)}
                            >
                                <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && (
                                    <div className="flex justify-between w-full items-center">
                                        <p className="text-sm text-white ml-3 whitespace-nowrap">Inventory</p>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                )}
                            </div>
                            <div
                                className={`
                                    overflow-hidden transition-all duration-300
                                    ${isSidebarOpen && isInventoryOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                {isSidebarOpen && (
                                    <div className="mt-1 space-y-1 pl-8">
                                        <div className={`flex items-center p-2 rounded-lg cursor-pointer ${activeMenu === 'inventory-dashboard' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`} onClick={() => handleNavigation('/inventory/dashboard')}>
                                            <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Dashboard</p>
                                        </div>
                                        <div className={`flex items-center p-2 rounded-lg cursor-pointer ${activeMenu === 'inventory-stocks' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`} onClick={() => handleNavigation('/inventory/stocks')}>
                                            <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Stocks</p>
                                        </div>
                                        <div className={`flex items-center p-2 rounded-lg cursor-pointer ${activeMenu === 'inventory-history' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`} onClick={() => handleNavigation('/inventory/history')}>
                                            <History className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">History</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reports */}
                        <div
                            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${activeMenu === 'reports' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                            onClick={() => handleNavigation('/Reports')}
                        >
                            <FileText className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Reports</p>}
                        </div>

                        {/* Print */}
                        <div
                            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${activeMenu === 'print' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                            onClick={() => handleNavigation('/Print')}
                        >
                            <Printer className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Print</p>}
                        </div>

                        {/* About */}
                        <div
                            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${activeMenu === 'about' ? 'bg-[#77536A]' : 'hover:bg-[#77536A]'}`}
                            onClick={() => handleNavigation('/About')}
                        >
                            <ShieldQuestion className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">About</p>}
                        </div>
                    </div>
                </nav>

                {/* Logout Button - Now opens the modal */}
                <div className="absolute bottom-6 left-0 right-0 px-4">
                    <div 
                        className={`flex items-center p-3 hover:bg-[#77536A] rounded-lg cursor-pointer ${!isSidebarOpen && 'justify-center'}`} 
                        onClick={() => setLogoutModalOpen(true)}
                    >
                        <LogOut className="w-5 h-5 text-white flex-shrink-0" />
                        {isSidebarOpen && <p className="text-sm ml-3 whitespace-nowrap">Logout</p>}
                    </div>
                </div>
            </div>

            {/* Render the LogoutModal */}
            <LogoutModal 
                isOpen={isLogoutModalOpen}
                setIsOpen={setLogoutModalOpen}
                onLogout={handleLogout}
            />
        </>
    );
};

export default Sidebar;