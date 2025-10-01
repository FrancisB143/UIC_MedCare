// resources/js/pages/Consultation/Student.tsx
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Bell,
    User,
    LayoutDashboard,
    Archive,
    FileText,
    History,
    ShieldQuestion,
    Search,
    Printer,
    GraduationCap,
    Briefcase,
    ChevronDown,
    Menu,
    MessageSquare
} from 'lucide-react';
import api from '../../services/api';

interface Student {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    program: string;
    year_level: string;
    section: string;
    contact_number: string;
    address: string;
    patient?: {
        date_of_birth: string;
        age: number;
        gender: string;
    };
}

const Student: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'lastName' | 'program'>('lastName');
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        console.log("Logout clicked");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const searchStudents = async (query: string) => {
        setLoading(true);
        try {
            const data = await api.students.search(query);
            setStudents(data);
        } catch (error) {
            console.error('Failed to search students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search and sort students
    useEffect(() => {
        if (searchTerm) {
            searchStudents(searchTerm);
        }
    }, [searchTerm]);

    const filteredAndSortedStudents = students
        .filter(student => 
            `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_number?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'lastName') {
                return a.last_name.localeCompare(b.last_name);
            } else {
                return a.program.localeCompare(b.program);
            }
        });

    return (
        <>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                    {/* Profile & Navigation */}
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

                    <nav className="mt-8">
                        <div className="px-4 space-y-2">
                            {/* Dashboard */}
                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/')}>
                                <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm font-medium text-white ml-3 whitespace-nowrap">Dashboard</p>}
                            </div>

                            {/* Search Submenu - Student Active */}
                            <div>
                                <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => setSearchOpen(!isSearchOpen)}>
                                    <Search className="w-5 h-5 text-white flex-shrink-0" />
                                    {isSidebarOpen && (
                                        <div className="flex justify-between w-full items-center">
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Search</p>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSearchOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    )}
                                </div>
                                {isSidebarOpen && isSearchOpen && (
                                    <div className="mt-1 space-y-1 pl-8">
                                        <div className="flex items-center p-2 bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/student')}>
                                            <GraduationCap className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Student</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/employee')}>
                                            <Briefcase className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Employee</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Inventory Submenu */}
                            <div>
                                <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => setInventoryOpen(!isInventoryOpen)}>
                                    <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                    {isSidebarOpen && (
                                        <div className="flex justify-between w-full items-center">
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Inventory</p>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    )}
                                </div>
                                {isSidebarOpen && isInventoryOpen && (
                                    <div className="mt-1 space-y-1 pl-8">
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/inventory/dashboard')}>
                                            <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Dashboard</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/inventory/stocks')}>
                                            <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Stocks</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/inventory/history')}>
                                            <History className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">History</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Reports')}>
                                <FileText className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Reports</p>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Print')}>
                                <Printer className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Print</p>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/About')}>
                                <ShieldQuestion className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">About</p>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Chat')}>
                                <MessageSquare className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Chat</p>}
                            </div>
                        </div>
                    </nav>

                    <div className="absolute bottom-6 left-0 right-0 px-4">
                        <div className={`flex items-center p-3 hover:bg-[#77536A] rounded-lg cursor-pointer ${!isSidebarOpen && 'justify-center'}`} onClick={handleLogout}>
                            <div className="w-5 h-5 flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16 13v-2H7V8l-5 4 5 4v-3z"/><path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/></svg>
                            </div>
                            {isSidebarOpen && <p className="text-sm ml-3 whitespace-nowrap">Logout</p>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    {/* Header */}
                    <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                        <div className="flex items-center justify-between">
                            <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20"><Menu className="w-6 h-6" /></button>
                            <div className="flex items-center"><img src="/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/><h1 className="text-white text-[28px] font-semibold">MEDICARE</h1></div>
                            <div className="flex items-center"><Bell className="w-6 h-6 text-white cursor-pointer" /></div>
                        </div>
                    </header>

                    {/* Student List Content */}
                    <main className="flex-1 p-6 overflow-y-auto bg-white">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Patients</h1>

                        {/* Search and Sort Controls */}
                        <div className="mb-6 flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search students..."
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
                                    onChange={(e) => setSortBy(e.target.value as 'lastName' | 'program')}
                                >
                                    <option value="lastName">Last Name</option>
                                    <option value="course">Course</option>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Course</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAndSortedStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.visit(`/consultation/student/${student.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{student.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{`${student.first_name} ${student.last_name}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{student.patient?.age || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{student.patient?.gender || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{student.program}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Student;