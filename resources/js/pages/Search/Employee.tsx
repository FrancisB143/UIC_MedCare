// resources/js/pages/Search/Employee.tsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
// @ts-ignore - local mock data module
import { getEmployees } from '../../data';

const Employee: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'lastName' | 'department'>('lastName');
    const [searchTerm, setSearchTerm] = useState('');

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        console.log("Logout clicked");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'New consultation assigned', isRead: false, createdAt: new Date().toISOString() }
    ];

    // Get employee data from centralized mock data
    const employees = getEmployees();

    // Filter and sort employees
    const filteredAndSortedEmployees = employees
        .filter((employee: any) => 
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a: any, b: any) => {
            if (sortBy === 'lastName') {
                const lastNameA = a.name.split(' ').pop() || '';
                const lastNameB = b.name.split(' ').pop() || '';
                return lastNameA.localeCompare(lastNameB);
            } else {
                return a.department.localeCompare(b.department);
            }
        });

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
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10 print:hidden">
                    <div className="flex items-center justify-between">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        <NotificationBell notifications={notifications} onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <h1 className="text-3xl font-bold text-black mb-6">Employee Patients</h1>

                    {/* Search and Sort Controls */}
                    <div className="mb-6 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A3386C] focus:border-[#A3386C] outline-none text-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-black font-medium">Sort by:</label>
                            <select
                                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A3386C] focus:border-[#A3386C] outline-none cursor-pointer text-black"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'lastName' | 'department')}
                            >
                                <option value="lastName">Last Name</option>
                                <option value="department">Department</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#D4A5B8] text-black">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Position</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAndSortedEmployees.map((employee: any) => (
                                    <tr
                                        key={employee.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleNavigation(`/consultation/employee/${employee.id}`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.position}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Employee;