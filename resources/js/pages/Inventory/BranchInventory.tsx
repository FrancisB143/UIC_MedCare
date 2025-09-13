import React, { useState, useEffect } from "react";
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import AddMedicineModal from '../../components/AddMedicineModal';
import RemovalReasonModal from '../../components/RemovalReasonModal';
import DispenseMedicineModal from '../../components/DispenseMedicineModal';
import ReorderMedicineModal from '../../components/ReorderMedicineModal';
import { router } from '@inertiajs/react';
import { ArrowLeft, Search, Menu, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { UserService } from '../../services/userService';
import { NotificationService } from '../../services/notificationService';
import { BranchInventoryService, BranchInventoryItem, Branch, Medicine } from '../../services/branchInventoryService';

// INTERFACES
interface DateTimeData {
    date: string;
    time: string;
}

// Legacy interface for compatibility with existing modals
interface MedicineFormData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

interface ReorderFormData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

interface SubmittedMedicineData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

// COMPONENT
const BranchInventoryPage: React.FC = () => {
    
    // STATE MANAGEMENT
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [isAddMedicineModalOpen, setAddMedicineModalOpen] = useState(false);
    const [isRemovalModalOpen, setRemovalModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState<BranchInventoryItem | null>(null);
    const [isDispenseModalOpen, setDispenseModalOpen] = useState(false);
    const [medicineToDispense, setMedicineToDispense] = useState<BranchInventoryItem | null>(null);
    const [isReorderModalOpen, setReorderModalOpen] = useState(false);
    const [medicineToReorder, setMedicineToReorder] = useState<BranchInventoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [branchInventory, setBranchInventory] = useState<BranchInventoryItem[]>([]);
    const [branchInfo, setBranchInfo] = useState<Branch | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [newlyAddedRecordId, setNewlyAddedRecordId] = useState<number | null>(null);
    const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];

    // HELPER FUNCTIONS
    function getCurrentDateTime(): DateTimeData {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        return { date, time };
    }

    // Check for low stock medicines based on reorder levels
    const checkLowStockMedicines = async () => {
        try {
            // Get all medicines with their current stock levels
            const currentStockLevels = branchInventory.reduce((acc: Record<number, number>, record) => {
                const medicineId = record.medicine_id;
                const quantity = record.quantity || 0;
                
                if (acc[medicineId]) {
                    acc[medicineId] += quantity;
                } else {
                    acc[medicineId] = quantity;
                }
                return acc;
            }, {} as Record<number, number>);

            // Find medicines that are below their reorder level (default 50)
            const lowStockMedicines = [];
            for (const record of branchInventory) {
                const currentStock = record.quantity || 0;
                const minimumLevel = 50; // Default reorder level
                
                if (currentStock <= minimumLevel) {
                    lowStockMedicines.push({
                        medicine_id: record.medicine_id,
                        medicine_name: record.medicine?.medicine_name,
                        current_stock: currentStock,
                        minimum_level: minimumLevel
                    });
                }
            }

            return lowStockMedicines;
        } catch (error) {
            console.error('Error checking low stock medicines:', error);
            return [];
        }
    };

    // EFFECTS
    useEffect(() => {
        loadInventoryData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(getCurrentDateTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Check for low stock medicines when branchInventory changes
    useEffect(() => {
        if (branchInventory.length > 0) {
            checkLowStockMedicines().then(async (lowStock) => {
                setLowStockMedicines(lowStock);
                
                // Create notifications for newly low stock medicines
                for (const medicine of lowStock) {
                    NotificationService.createNotification(
                        `Low Stock Alert: ${medicine.medicine_name} has only ${medicine.current_stock} units remaining`,
                        'warning'
                    );
                }
            });
        }
    }, [branchInventory]);

    const { date, time } = dateTime;

    // SUPABASE FUNCTIONS
    // SUPABASE FUNCTIONS
    const loadInventoryData = async () => {
        setIsLoading(true);
        try {
            console.log('Loading user and inventory data from Supabase...');
            
            // Get current user first
            const user = UserService.getCurrentUser();
            if (!user || !user.user_id) {
                throw new Error('User not found. Please log in.');
            }
            
            setCurrentUser(user);
            
            // Get user's branch info
            const branchInfo = await BranchInventoryService.getUserBranchInfo(user.user_id);
            if (!branchInfo) {
                throw new Error('User is not assigned to any branch.');
            }
            
            setBranchInfo(branchInfo);
            console.log('User branch info:', branchInfo);
            
            // Load medicines for the dropdown/reference
            const medicines = await BranchInventoryService.getAllMedicines();
            setMedicines(medicines);
            
            // Load branch inventory
            const inventory = await BranchInventoryService.getBranchInventory(branchInfo.branch_id);
            setBranchInventory(inventory);
            
            console.log('Branch inventory loaded:', inventory);
            
        } catch (error) {
            console.error('Error loading inventory data:', error);
            alert(error instanceof Error ? error.message : 'Failed to load inventory data');
        } finally {
            setIsLoading(false);
        }
    };

    // EVENT HANDLERS
    const handleNavigation = (path: string): void => router.visit(path);
    
    const handleLogout = (): void => {
        UserService.clearUserSession();
        router.visit("/");
    };
    
    const handleBackToStocks = (): void => router.visit('/inventory/stocks');

    const handleAddMedicine = (): void => setAddMedicineModalOpen(true);

    const handleOpenRemovalModal = (record: BranchInventoryItem) => {
        setMedicineToDelete(record);
        setRemovalModalOpen(true);
    };
    
    const handleConfirmRemoval = async (reason: string) => {
        if (medicineToDelete !== null && branchInfo && currentUser) {
            try {
                console.log('=== REMOVAL DEBUG START ===');
                console.log('Medicine to delete:', medicineToDelete);
                console.log('Branch info:', branchInfo);
                console.log('Current user:', currentUser);
                
                // Test database connectivity first
                console.log('Testing database connection...');
                try {
                    const { data: testData, error: testError } = await supabase
                        .from('medicine_stock_in')
                        .select('medicine_stock_in_id')
                        .limit(1);
                    
                    if (testError) {
                        console.error('Database connection test failed:', testError);
                        alert(`Database connection error: ${testError.message}`);
                        return;
                    }
                    console.log('✅ Database connection test passed');
                } catch (dbError) {
                    console.error('Database connection error:', dbError);
                    alert('Database connection failed. Please check your internet connection.');
                    return;
                }

                // Check if medicine_deleted table exists
                console.log('Testing medicine_deleted table...');
                try {
                    const { data: deletedTest, error: deletedError } = await supabase
                        .from('medicine_deleted')
                        .select('*')
                        .limit(1);
                    
                    if (deletedError) {
                        console.error('medicine_deleted table test failed:', deletedError);
                        console.log('⚠️ medicine_deleted table may not exist, creating manual record...');
                        
                        // If medicine_deleted table doesn't exist, we'll create a log record differently
                        // For now, let's just mark the stock as "deleted" by setting quantity to 0
                        // or use a different approach
                        
                        alert(`Medicine deletion failed: medicine_deleted table is not accessible (${deletedError.message}). Please contact your administrator to set up the medicine_deleted table.`);
                        return;
                    }
                    console.log('✅ medicine_deleted table exists and is accessible');
                } catch (tableError) {
                    console.error('Table check error:', tableError);
                    alert('Unable to verify database tables. Please contact your administrator.');
                    return;
                }

                const currentQuantity = medicineToDelete.quantity || 0;
                
                // Check if we have medicine_stock_in_id (for individual stock record deletion)
                if (medicineToDelete.medicine_stock_in_id) {
                    console.log('Using direct stock record deletion method');
                    console.log('Stock record ID:', medicineToDelete.medicine_stock_in_id);
                    console.log('Quantity to delete:', currentQuantity);
                    
                    // Delete the specific stock record directly
                    const success = await BranchInventoryService.deleteMedicine(
                        medicineToDelete.medicine_stock_in_id,
                        currentQuantity,
                        reason || 'Medicine removed from inventory',
                        currentUser.user_id
                    );

                    if (!success) {
                        console.error('❌ Direct deletion failed');
                        alert('Failed to remove medicine. Please check the console for details and try again.');
                        return;
                    }
                    
                    console.log('✅ Direct deletion succeeded');
                } else {
                    console.log('❌ No medicine_stock_in_id found, cannot delete individual record');
                    alert('Cannot delete medicine: missing stock record ID. Please refresh the page and try again.');
                    return;
                }

                console.log('✅ Successfully removed medicine from branch inventory');
                
                // Show success message
                alert(`Successfully removed ${currentQuantity} units of ${medicineToDelete.medicine?.medicine_name}. Medicine has been completely removed from branch inventory.`);

                setMedicineToDelete(null);
                setRemovalModalOpen(false);
                
                // Reload data after removal
                console.log('Reloading inventory data...');
                await loadInventoryData();
                console.log('✅ Inventory data reloaded');
                
            } catch (error) {
                console.error('❌ Unexpected error during medicine removal:', error);
                console.error('Error details:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : 'No stack trace'
                });
                alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`);
            }
        } else {
            console.error('❌ Missing required data for deletion:', {
                medicineToDelete: !!medicineToDelete,
                branchInfo: !!branchInfo,
                currentUser: !!currentUser
            });
            alert('Missing required information. Please refresh the page and try again.');
        }
    };

    const handleOpenDispenseModal = (record: BranchInventoryItem) => {
        setMedicineToDispense(record);
        setDispenseModalOpen(true);
    };

    const handleConfirmDispense = async (quantity: number) => {
        if (medicineToDispense && branchInfo && currentUser) {
            try {
                const currentQuantity = medicineToDispense.quantity || 0;
                const newQuantity = currentQuantity - quantity;

                console.log(`Dispensing ${quantity} of ${medicineToDispense.medicine?.medicine_name}. Current: ${currentQuantity}, New: ${newQuantity}`);

                if (newQuantity < 0) {
                    alert('Cannot dispense more than available quantity');
                    return;
                }

                // Use the new stock out system
                const success = await BranchInventoryService.dispenseMedicineByMedicineId(
                    medicineToDispense.medicine_id,
                    branchInfo.branch_id,
                    currentUser.user_id,
                    quantity
                );

                if (!success) {
                    alert('Failed to dispense medicine. Please try again.');
                    return;
                }

                console.log('Successfully dispensed medicine using stock out system');
                
                // Show success message
                if (newQuantity === 0) {
                    alert(`Successfully dispensed ${quantity} units. Medicine is now out of stock.`);
                } else {
                    alert(`Successfully dispensed ${quantity} units. Remaining quantity: ${newQuantity}`);
                }

                setMedicineToDispense(null);
                // Reload data after dispensing
                await loadInventoryData();
                
                // Check if the remaining quantity is 50 or below and trigger notification
                if (newQuantity <= 50 && newQuantity > 0) {
                    // Create a low stock notification
                    NotificationService.createNotification(
                        `Low Stock Alert: ${medicineToDispense.medicine?.medicine_name || 'Medicine'} has only ${newQuantity} units remaining`,
                        'warning'
                    );
                    
                    console.log(`Low stock notification created for: ${medicineToDispense.medicine?.medicine_name}`);
                }
            } catch (error) {
                console.error('Unexpected error during dispensing:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };
    
    const handleOpenReorderModal = (record: BranchInventoryItem) => {
        setMedicineToReorder(record);
        setReorderModalOpen(true);
    };

    const handleConfirmReorder = async (formData: SubmittedMedicineData) => {
        if (medicineToReorder && branchInfo && currentUser) {
            try {
                console.log(`Reordering ${medicineToReorder.medicine?.medicine_name}`, formData);
                console.log('Creating NEW stock entry with:');
                console.log('- Medicine ID:', medicineToReorder.medicine_id);
                console.log('- Branch ID:', branchInfo.branch_id);
                console.log('- User ID:', currentUser.user_id);
                console.log('- Quantity:', formData.quantity);
                console.log('- Date Received:', formData.dateReceived);
                console.log('- Expiration Date:', formData.expirationDate);

                // Create a NEW stock in record - this will add a separate row to medicine_stock_in table
                const stockInRecord = await BranchInventoryService.addMedicineStockIn(
                    medicineToReorder.medicine_id,
                    branchInfo.branch_id,
                    currentUser.user_id,
                    formData.quantity,
                    formData.dateReceived,
                    formData.expirationDate
                );

                if (!stockInRecord) {
                    alert('Failed to add new medicine stock. Please try again.');
                    return;
                }

                console.log('Successfully created new stock in record:', stockInRecord);
                
                // Show success message with details
                alert(`Successfully added ${formData.quantity} units of ${formData.medicineName} to inventory.\n\nNew Entry Details:\n- Expiration Date: ${new Date(formData.expirationDate).toLocaleDateString()}\n- Date Received: ${new Date(formData.dateReceived).toLocaleDateString()}\n- Quantity: ${formData.quantity} units\n\nThis creates a separate inventory record with its own expiration tracking.`);

                setMedicineToReorder(null);
                // Reload data to show the new separate entry
                await loadInventoryData();
            } catch (error) {
                console.error('Unexpected error during reorder:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleAddMedicineSubmit = async (medicineData: MedicineFormData) => {
        if (!currentUser || !branchInfo) {
            alert('Please log in and ensure you are assigned to a branch.');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Adding medicine with data:', medicineData);
            console.log('Current user:', currentUser);
            console.log('Branch info:', branchInfo);
            
            // Validate required fields
            if (!medicineData.medicineName || !medicineData.category || !medicineData.quantity) {
                throw new Error('Medicine name, category, and quantity are required');
            }
            
            // Create or get medicine
            console.log('Creating/getting medicine...');
            const medicine = await BranchInventoryService.createMedicine(
                medicineData.medicineName,
                medicineData.category
            );

            if (!medicine) {
                throw new Error('Failed to create or retrieve medicine');
            }

            console.log('Medicine created/retrieved:', medicine);

            // Add stock using the new stock in system
            console.log('Adding stock using stock in system...');
            const stockInRecord = await BranchInventoryService.addMedicineStockIn(
                medicine.medicine_id,
                branchInfo.branch_id,
                currentUser.user_id,
                parseInt(medicineData.quantity.toString()),
                medicineData.dateReceived,
                medicineData.expirationDate
            );

            if (!stockInRecord) {
                throw new Error('Failed to add medicine to inventory using stock in system');
            }

            console.log('Medicine and stock added successfully using stock in system!');
            
            // Close modal and reload data
            setAddMedicineModalOpen(false);
            await loadInventoryData();
            
            // Show success message
            alert(`Medicine "${medicineData.medicineName}" has been successfully added to the inventory!`);
            
        } catch (error) {
            console.error('Error adding medicine:', error);
            
            // Show detailed error message
            let errorMessage = 'Failed to add medicine. ';
            if (error instanceof Error) {
                errorMessage += error.message;
                console.error('Detailed error:', error);
            } else {
                errorMessage += 'Please try again.';
            }
            
            // Check browser console for more details
            errorMessage += '\n\nPlease check the browser console for more details.';
            
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredStockRecords = (): BranchInventoryItem[] => {
        console.log('Branch inventory data:', branchInventory);
        
        const filtered = branchInventory.filter((record: BranchInventoryItem) => {
            console.log('Processing record:', record);
            
            const medicine = record.medicine;
            console.log('Medicine data:', medicine);
            
            // Filter out medicines with zero or negative quantity (removed medicines)
            const hasQuantity = (record.quantity || 0) > 0;
            console.log('Has quantity:', hasQuantity, 'Quantity:', record.quantity);
            
            // If no search term, show all records with quantity > 0
            if (!searchTerm || searchTerm.trim() === '') {
                console.log('No search term, including record');
                return hasQuantity;
            }
            
            // Apply search filter only if there's a search term
            const medicineName = medicine?.medicine_name?.toLowerCase() || '';
            const medicineCategory = medicine?.medicine_category?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            const matchesSearch = medicineName.includes(searchLower) || medicineCategory.includes(searchLower);
            console.log('Matches search:', matchesSearch, 'Medicine name:', medicineName, 'Search term:', searchLower);
            
            const shouldInclude = hasQuantity && matchesSearch;
            console.log('Should include record:', shouldInclude);
            
            return shouldInclude;
        });
        
        console.log('Total inventory records:', branchInventory.length);
        console.log('Records with quantity > 0:', branchInventory.filter((r: BranchInventoryItem) => (r.quantity || 0) > 0).length);
        console.log('Filtered records:', filtered.length);
        console.log('Search term:', searchTerm);
        
        return filtered;
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    if (!branchInfo) {
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
                branchName={branchInfo?.branch_name}
            />
            <RemovalReasonModal
                isOpen={isRemovalModalOpen}
                setIsOpen={setRemovalModalOpen}
                onSubmit={handleConfirmRemoval}
                currentStock={medicineToDelete?.quantity || 0}
                medicineName={medicineToDelete?.medicine?.medicine_name}
                medicineCategory={medicineToDelete?.medicine?.medicine_category}
            />
            {medicineToDispense && (
                <DispenseMedicineModal
                    isOpen={isDispenseModalOpen}
                    setIsOpen={setDispenseModalOpen}
                    onSubmit={handleConfirmDispense}
                    currentStock={medicineToDispense.quantity || 0}
                    medicineName={medicineToDispense.medicine?.medicine_name || 'Unknown Medicine'}
                    medicineCategory={medicineToDispense.medicine?.medicine_category || 'No Category'}
                />
            )}
            {medicineToReorder && (
                <ReorderMedicineModal
                    isOpen={isReorderModalOpen}
                    setIsOpen={setReorderModalOpen}
                    onSubmit={handleConfirmReorder}
                    medicineName={medicineToReorder.medicine?.medicine_name || ''}
                    category={medicineToReorder.medicine?.medicine_category || ''}
                    currentStock={medicineToReorder.quantity || 0}
                />
            )}

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
                            lowStockMedicines={lowStockMedicines}
                            onSeeAll={() => handleNavigation('/Notification')}
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
                                <p className="text-gray-600 text-sm">{branchInfo.branch_name}</p>
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
                        
                        {/* Custom Inventory Table */}
                        <div className="bg-white rounded-lg overflow-auto flex-1">
                            <table className="w-full">
                                <thead className="bg-[#F9E7F0] text-black sticky top-0 z-10"> 
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold">MEDICINE NAME</th>
                                        <th className="px-6 py-4 text-left font-bold">CATEGORY</th>
                                        <th className="px-6 py-4 text-left font-bold">DATE RECEIVED</th>
                                        <th className="px-6 py-4 text-left font-bold">EXPIRATION DATE</th>
                                        <th className="px-6 py-4 text-left font-bold">QUANTITY</th>
                                        <th className="px-6 py-4 text-center font-bold">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : getFilteredStockRecords().length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                {branchInventory.length === 0 
                                                    ? 'No medicines in inventory yet. Click "ADD MEDICINE" to add your first medicine.' 
                                                    : `No medicines found matching "${searchTerm}". Total medicines in inventory: ${branchInventory.length}`
                                                }
                                            </td>
                                        </tr>
                                    ) : (
                                        getFilteredStockRecords().map((record) => (
                                            <tr 
                                                key={record.medicine_id} 
                                                className={`hover:bg-gray-50 transition-colors duration-300 ${
                                                    newlyAddedRecordId === record.medicine_id 
                                                        ? 'bg-green-50 border-green-200' 
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 font-medium">
                                                        {record.medicine?.medicine_name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {record.medicine?.medicine_category || 'No Category'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {record.date_received ? new Date(record.date_received).toLocaleDateString() : 'Not Set'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {record.expiration_date ? new Date(record.expiration_date).toLocaleDateString() : 'Not Set'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">
                                                    {record.quantity || 0}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button 
                                                            onClick={() => handleOpenDispenseModal(record)} 
                                                            className="bg-red-200 text-red-800 hover:bg-red-300 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors" 
                                                            title="Dispense Medicine"
                                                        >
                                                            -
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenReorderModal(record)} 
                                                            className="bg-green-200 text-green-800 hover:bg-green-300 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors" 
                                                            title="Reorder/Add Stock"
                                                        >
                                                            +
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenRemovalModal(record)} 
                                                            className="text-gray-500 hover:text-red-600 p-1 transition-colors" 
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

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
