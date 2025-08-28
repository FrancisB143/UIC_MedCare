import React, { useState, useEffect } from "react";
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import AddMedicineModal from '../../components/AddMedicineModal';
import RemovalReasonModal from '../../components/RemovalReasonModal';
import DispenseMedicineModal from '../../components/DispenseMedicineModal';
import ReorderMedicineModal from '../../components/ReorderMedicineModal';
import InventoryTable from '../../components/InventoryTable';
import { router } from '@inertiajs/react';
import { ArrowLeft, Search, Menu } from 'lucide-react';
import { 
    Medicine, 
    ClinicBranch, 
    getBranchById, 
    getMedicinesForBranch as getBranchMedicines 
} from '../../data/branchMedicines';

// INTERFACES
interface DateTimeData {
    date: string;
    time: string;
}

interface MedicineFormData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

// Interface for the data coming from the Reorder Modal submission
interface ReorderSubmissionData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}


// COMPONENT
const BranchInventoryPage: React.FC<{ branchId: number }> = ({ branchId }) => {
    
    // STATE MANAGEMENT
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [isAddMedicineModalOpen, setAddMedicineModalOpen] = useState(false);
    const [isRemovalModalOpen, setRemovalModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState<number | null>(null);
    const [isDispenseModalOpen, setDispenseModalOpen] = useState(false);
    const [medicineToDispense, setMedicineToDispense] = useState<Medicine | null>(null);
    const [isReorderModalOpen, setReorderModalOpen] = useState(false);
    const [medicineToReorder, setMedicineToReorder] = useState<Medicine | null>(null);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [branch, setBranch] = useState<ClinicBranch | null>(null);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    // HELPER FUNCTIONS
    function getCurrentDateTime(): DateTimeData {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        return { date, time };
    }

    // EFFECTS
    useEffect(() => {
        if (branchId) {
            const branchData = getBranchById(branchId);
            const branchMedicines = getBranchMedicines(branchId);
            if (branchData) {
                setBranch(branchData);
                setMedicines(branchMedicines);
            } else {
                console.error(`Branch with ID ${branchId} not found`);
                router.visit('/stocks');
            }
        }
    }, [branchId]);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(getCurrentDateTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { date, time } = dateTime;

    // EVENT HANDLERS
    const handleNavigation = (path: string): void => router.visit(path);
    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };
    const handleBackToStocks = (): void => router.visit('/inventory/stocks');

    const handleOpenRemovalModal = (id: number) => {
        setMedicineToDelete(id);
        setRemovalModalOpen(true);
    };
    
    const handleConfirmRemoval = (reason: string) => {
        if (medicineToDelete !== null) {
            console.log(`Removing medicine with ID: ${medicineToDelete}. Reason: "${reason}"`);
            setMedicines(prev => prev.filter(med => med.id !== medicineToDelete));
            setMedicineToDelete(null);
            alert('Medicine has been removed successfully.');
        }
    };

    const handleOpenDispenseModal = (medicine: Medicine) => {
        setMedicineToDispense(medicine);
        setDispenseModalOpen(true);
    };

    const handleConfirmDispense = (quantity: number) => {
        if (medicineToDispense) {
            setMedicines(prev => prev.map(med =>
                med.id === medicineToDispense.id ? { ...med, stock: Math.max(0, med.stock - quantity) } : med
            ));
            console.log(`Dispensed ${quantity} of ${medicineToDispense.name}`);
            setMedicineToDispense(null);
        }
    };
    
    const handleOpenReorderModal = (medicine: Medicine) => {
        setMedicineToReorder(medicine);
        setReorderModalOpen(true);
    };

    // --- THIS IS THE UPDATED REORDER FUNCTION ---
    const handleConfirmReorder = (formData: ReorderSubmissionData) => {
        // 1. Generate a new unique ID for the new row
        const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;

        // 2. Create the new medicine object for the new inventory row
        const newMedicineRow: Medicine = {
            id: newId,
            name: formData.medicineName,
            category: formData.category,
            stock: formData.quantity,
            minStock: Math.floor(formData.quantity * 0.2), // Set a default minimum stock
            expiry: formData.expirationDate,
        };

        // 3. Add the new medicine row to the state array
        setMedicines(prevMedicines => [...prevMedicines, newMedicineRow]);

        // 4. Reset the state and show a confirmation message
        setMedicineToReorder(null);
        alert(`A new batch of "${formData.medicineName}" has been successfully added to the inventory.`);
    };
    // ---------------------------------------------

    const handleAddMedicine = (): void => setAddMedicineModalOpen(true);

    const handleAddMedicineSubmit = (medicineData: MedicineFormData): void => {
        const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
        const newMedicine: Medicine = {
            id: newId,
            name: medicineData.medicineName,
            category: medicineData.category,
            stock: medicineData.quantity,
            minStock: Math.floor(medicineData.quantity * 0.2),
            expiry: medicineData.expirationDate,
        };
        setMedicines(prev => [...prev, newMedicine]);
        console.log('New medicine added:', newMedicine);
    };

    const getFilteredAndSortedMedicines = (): Medicine[] => {
        let processed = medicines.filter(med =>
            med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return processed.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    if (!branch) {
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <p className="text-gray-500 text-lg">Loading branch data...</p>
            </div>
        );
    }

    // JSX RENDER
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
            
            {/* --- MODALS --- */}
            <AddMedicineModal
                isOpen={isAddMedicineModalOpen}
                setIsOpen={setAddMedicineModalOpen}
                onAddMedicine={handleAddMedicineSubmit}
                branchName={`${branch.name} ${branch.suffix}`.trim()}
            />
            <RemovalReasonModal
                isOpen={isRemovalModalOpen}
                setIsOpen={setRemovalModalOpen}
                onSubmit={handleConfirmRemoval}
            />
            {medicineToDispense && (
                <DispenseMedicineModal
                    isOpen={isDispenseModalOpen}
                    setIsOpen={setDispenseModalOpen}
                    onSubmit={handleConfirmDispense}
                    currentStock={medicineToDispense.stock}
                />
            )}
            {medicineToReorder && (
                <ReorderMedicineModal
                    isOpen={isReorderModalOpen}
                    setIsOpen={setReorderModalOpen}
                    onSubmit={handleConfirmReorder}
                    medicineName={medicineToReorder.name}
                    category={medicineToReorder.category}
                />
            )}
            {/* ----------------- */}

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 flex-shrink-0 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        <NotificationBell
                            notifications={notifications}
                            onSeeAll={() => handleNavigation('/notifications')}
                        />
                    </div>
                </header>

                <main className="bg-gray-100 flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white flex-shrink-0">
                        <div className="flex items-start px-8 py-4">
                            <button onClick={handleBackToStocks} className="flex items-center text-gray-600 hover:text-[#a3386c] transition-colors duration-200 mt-2">
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
                                    className={`w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] focus:border-transparent text-sm ${searchTerm ? 'text-black' : 'text-gray-400'}`}
                                />
                            </div>
                        </div>
                        
                        <InventoryTable 
                            medicines={getFilteredAndSortedMedicines()}
                            onDispense={handleOpenDispenseModal}
                            onReorder={handleOpenReorderModal}
                            onRemove={handleOpenRemovalModal}
                            searchTerm={searchTerm}
                        />

                        <div className="flex justify-end mt-8 flex-shrink-0">
                            <button onClick={handleAddMedicine} className="bg-[#a3386c] hover:bg-[#8a2f5a] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 cursor-pointer transform hover:scale-105">
                                ADD MEDICINE
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BranchInventoryPage;