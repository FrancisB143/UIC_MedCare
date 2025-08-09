import React, { useState, useEffect } from "react";
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import AddMedicineModal from '../../components/AddMedicineModal';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    HandCoins,
    SquarePen,
    Trash2,
    Search,
    Menu
} from 'lucide-react';
import { 
    Medicine, 
    ClinicBranch, 
    getBranchById, 
    getMedicinesForBranch as getBranchMedicines 
} from '../../data/branchMedicines';

interface DateTimeData {
    date: string;
    time: string;
}

interface BranchInventoryPageProps {
    branchId: number; // Passed from Laravel controller via Inertia
}

interface MedicineFormData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

const BranchInventoryPage: React.FC<BranchInventoryPageProps> = ({ branchId }) => {
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [isAddMedicineModalOpen, setAddMedicineModalOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [branch, setBranch] = useState<ClinicBranch | null>(null);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    // Notifications (same as Dashboard)
    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    // Get current date and time
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

    // Load branch data and medicines on component mount
    useEffect(() => {
        if (branchId) {
            const branchData = getBranchById(branchId);
            const branchMedicines = getBranchMedicines(branchId);
            
            if (branchData) {
                setBranch(branchData);
                setMedicines(branchMedicines);
            } else {
                // Handle case where branch is not found
                console.error(`Branch with ID ${branchId} not found`);
                // Optionally redirect back to stocks page
                router.visit('/stocks');
            }
        }
    }, [branchId]);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const handleBackToStocks = (): void => {
        router.visit('/inventory/stocks');
    };

    const handleEdit = (id: number): void => {
        console.log(`Edit medicine with id: ${id}`);
        // TODO: Implement edit functionality
    };

    const handleDelete = (id: number): void => {
        console.log(`Delete medicine with id: ${id}`);
        // TODO: Implement delete functionality
        // You might want to show a confirmation modal before deleting
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            // Remove medicine from state
            setMedicines(prevMedicines => 
                prevMedicines.filter(medicine => medicine.id !== id)
            );
            // Here you would also make an API call to delete from the backend
        }
    };

    const handleDispense = (id: number): void => {
        console.log(`Dispense medicine with id: ${id}`);
        // TODO: Implement dispense functionality
    };

    const handleAddMedicine = (): void => {
        setAddMedicineModalOpen(true);
    };

    const handleAddMedicineSubmit = (medicineData: MedicineFormData): void => {
        // Generate new ID (in a real app, this would come from the backend)
        const newId = Math.max(...medicines.map(m => m.id)) + 1;
        
        const newMedicine: Medicine = {
            id: newId,
            name: medicineData.medicineName,
            category: medicineData.category,
            stock: medicineData.quantity,
            minStock: Math.floor(medicineData.quantity * 0.2), // Set min stock to 20% of initial stock
            expiry: medicineData.expirationDate,
        };

        // Add new medicine to state
        setMedicines(prevMedicines => [...prevMedicines, newMedicine]);
        
        console.log('New medicine added:', newMedicine);
        console.log('Date received:', medicineData.dateReceived); // Log separately since it's not part of Medicine type
        
        // Here you would make an API call to save to the backend
        // Example: await saveMedicine(branchId, newMedicine, medicineData.dateReceived);
        
        // Show success message (you might want to add a toast notification)
        alert(`Medicine "${medicineData.medicineName}" has been added successfully!`);
    };

    // Filter medicines based on search term
    const getFilteredMedicines = (): Medicine[] => {
        if (searchTerm) {
            return medicines.filter(medicine =>
                medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return medicines;
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Show loading state while branch data is being loaded
    if (!branch) {
        return (
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    isSearchOpen={isSearchOpen}
                    setSearchOpen={setSearchOpen}
                    isInventoryOpen={isInventoryOpen}
                    setInventoryOpen={setInventoryOpen}
                    handleNavigation={handleNavigation}
                    handleLogout={handleLogout}
                    activeMenu="inventory-stocks"
                />
                <div className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="text-center">
                        <p className="text-gray-500 text-lg">Loading branch data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-stocks"
            />

            {/* Add Medicine Modal */}
            <AddMedicineModal
                isOpen={isAddMedicineModalOpen}
                setIsOpen={setAddMedicineModalOpen}
                onAddMedicine={handleAddMedicineSubmit}
                branchName={`${branch.name} ${branch.suffix}`.trim()}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 flex-shrink-0 z-10">
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
                            notifications={notifications}
                            onSeeAll={() => handleNavigation('/notifications')}
                        />
                    </div>
                </header>

                {/* Branch Inventory Content */}
                <div className="bg-gray-100 flex-1 flex flex-col overflow-hidden">
                    {/* Back Button and Date/Time */}
                    <div className="bg-white flex-shrink-0">
                        <div className="flex items-start px-8 py-4">
                            <button
                                onClick={handleBackToStocks}
                                className="flex items-center text-gray-600 hover:text-[#a3386c] transition-colors duration-200 mt-2"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </button>
                            <div className="flex-1 flex justify-center">
                                <div className="flex flex-col items-center">
                                    <p className="text-[22px] font-normal text-black">{date}</p>
                                    <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                                    <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Available List */}
                    <div className="bg-white px-8 py-6 flex-1 flex flex-col overflow-hidden" style={{ minHeight: '528px' }}>
                        <div className="flex items-center justify-between mb-6 flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-medium text-black mb-1">Stock Available List</h2>
                                <p className="text-gray-600 text-sm">{branch.name} {branch.suffix}</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search Medicine"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] focus:border-transparent text-sm ${
                                        searchTerm ? 'text-black' : 'text-gray-400'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-auto flex-1">
                            <table className="w-full">
                                <thead className="bg-[#D4A5B8] text-black sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-medium">MEDICINE NAME</th>
                                        <th className="px-6 py-4 text-left font-medium">CATEGORY</th>
                                        <th className="px-6 py-4 text-left font-medium">DATE RECEIVED</th>
                                        <th className="px-6 py-4 text-left font-medium">EXPIRATION DATE</th>
                                        <th className="px-6 py-4 text-left font-medium">QUANTITY</th>
                                        <th className="px-6 py-4 text-center font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {getFilteredMedicines().map((medicine) => (
                                        <tr key={medicine.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 font-medium">
                                                    {medicine.category === "Pain Relief" ? "RITEMED" :
                                                        medicine.category === "Antibiotic" ? "RITEMED" :
                                                        medicine.category === "Anti-inflammatory" ? "RITEMED" :
                                                        medicine.name.split(' ')[0]}
                                                </div>
                                                <div className="text-gray-600 text-sm">{medicine.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{medicine.category}</td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {/* You can store dateReceived separately or use a default */}
                                                2025-03-25
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {medicine.expiry === "N/A" ? "2027-03-25" : medicine.expiry}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">{medicine.stock}</td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <button
                                                        onClick={() => handleEdit(medicine.id)}
                                                        className="text-gray-500 hover:text-blue-700 p-1 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <SquarePen className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(medicine.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDispense(medicine.id)}
                                                        className="text-gray-700 hover:text-green-700 p-1 rounded-full"
                                                        title="Dispense"
                                                    >
                                                        <HandCoins className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {getFilteredMedicines().length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        {searchTerm ? 'No medicines found matching your search.' : 'No medicines available in this branch.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-8 flex-shrink-0">
                            <button
                                className="bg-[#a3386c] hover:bg-[#8a2f5a] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 cursor-pointer transform hover:scale-105"
                                onClick={handleAddMedicine}
                            >
                                ADD MEDICINE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchInventoryPage;