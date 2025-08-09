import React, { useState } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { router } from '@inertiajs/react';
import Sidebar from '../components/Sidebar'; // Import Sidebar
import { Menu } from 'lucide-react';

const About: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

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
                activeMenu="about" // <-- Highlight About as active
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
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

                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="max-w-4xl mx-auto py-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-6">About MEDITRACK</h1>

                        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Developer Information</h2>
                            <p className="text-gray-600 mb-4">
                                MEDITRACK was developed by a dedicated team of student developers from the University of the Immaculate Conception (UIC) as part of their capstone project.
                                Our goal was to create an intuitive and efficient system for managing medical inventory, consultations, and patient records within a clinic setting.
                            </p>
                            <p className="text-gray-600 mb-4">
                                This system aims to streamline daily operations, reduce manual errors, and provide comprehensive reporting capabilities to enhance the overall efficiency of clinic management.
                            </p>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Our Team:</h3>
                            <ul className="list-disc list-inside text-gray-600 mb-4">
                                <li>John Doe - Lead Developer</li>
                                <li>Jane Smith - UI/UX Designer</li>
                                <li>Peter Jones - Backend Developer</li>
                                <li>Alice Brown - Quality Assurance</li>
                            </ul>
                            <p className="text-gray-600">
                                We are committed to continuous improvement and welcome feedback to make MEDITRACK even better.
                            </p>
                        </div>

                        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Version Information</h2>
                            <p className="text-gray-600"><strong>Version:</strong> 1.0.0 (Initial Release)</p>
                            <p className="text-gray-600"><strong>Release Date:</strong> July 28, 2025</p>
                            <p className="text-gray-600 mt-4">Thank you for using MEDITRACK!</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default About;