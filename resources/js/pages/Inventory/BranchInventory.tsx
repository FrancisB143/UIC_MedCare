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

// INTERFACES
interface DateTimeData {
    date: string;
    time: string;
}

interface Medicine {
    medicine_id: number;
    medicine_name: string;
    medicine_category: string;
}

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface StockIn {
    medicine_stock_in_id: number;
    medicine_id: number;
    quantity: number;
    date_received: string;
    expiration_date: string;
    user_id: number;
    medicine?: Medicine;
}

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
const BranchInventoryPage: React.FC<{ branchId: number }> = ({ branchId }) => {
    
    // STATE MANAGEMENT
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [isAddMedicineModalOpen, setAddMedicineModalOpen] = useState(false);
    const [isRemovalModalOpen, setRemovalModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState<StockIn | null>(null);
    const [isDispenseModalOpen, setDispenseModalOpen] = useState(false);
    const [medicineToDispense, setMedicineToDispense] = useState<StockIn | null>(null);
    const [isReorderModalOpen, setReorderModalOpen] = useState(false);
    const [medicineToReorder, setMedicineToReorder] = useState<StockIn | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [stockInRecords, setStockInRecords] = useState<StockIn[]>([]);
    const [branchInfo, setBranchInfo] = useState<Branch | null>(null);
    const [newlyAddedRecordId, setNewlyAddedRecordId] = useState<number | null>(null);

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
        loadInventoryData();
        loadBranchInfo();
    }, [branchId]);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(getCurrentDateTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { date, time } = dateTime;

    // SUPABASE FUNCTIONS
    const loadBranchInfo = async () => {
        try {
            const { data: branchData, error: branchError } = await supabase
                .from('branches')
                .select('branch_id, branch_name')
                .eq('branch_id', branchId)
                .single();

            if (branchError) {
                console.error('Error loading branch info:', branchError);
                return;
            }

            setBranchInfo(branchData);
        } catch (error) {
            console.error('Error loading branch info:', error);
        }
    };

    const loadInventoryData = async () => {
        setIsLoading(true);
        try {
            console.log('Loading inventory data from Supabase...');
            
            // Load all medicines first from Supabase
            const { data: medicinesData, error: medicinesError } = await supabase
                .from('medicines')
                .select('*')
                .order('medicine_name');

            if (medicinesError) {
                console.error('Error loading medicines:', medicinesError);
                throw medicinesError;
            }

            console.log('Medicines from Supabase:', medicinesData);

            // Load stock records from Supabase
            const { data: stockRecords, error: stockRecordsError } = await supabase
                .from('medicine_stock_in')
                .select('*')
                .order('date_received', { ascending: false });
            
            if (stockRecordsError) {
                console.error('Error loading stock records:', stockRecordsError);
                throw stockRecordsError;
            }

            console.log('Stock records from Supabase:', stockRecords);
            
            // Manually join the data
            const stockData = stockRecords?.map(record => {
                const medicine = medicinesData?.find(med => med.medicine_id === record.medicine_id);
                console.log(`Stock record ${record.medicine_stock_in_id} linked to medicine:`, medicine);
                return {
                    ...record,
                    medicine: medicine
                };
            }) || [];

            console.log('Final joined data:', stockData);

            setMedicines(medicinesData || []);
            setStockInRecords(stockData || []);
        } catch (error) {
            console.error('Error loading inventory data:', error);
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

    const handleOpenRemovalModal = (record: StockIn) => {
        setMedicineToDelete(record);
        setRemovalModalOpen(true);
    };
    
    const handleConfirmRemoval = async (reason: string) => {
        if (medicineToDelete !== null) {
            try {
                const currentQuantity = medicineToDelete.quantity || 0;
                
                console.log(`Removing entire stock of ${medicineToDelete.medicine?.medicine_name}. Quantity: ${currentQuantity}`);

                // Step 1: Record the deletion in medicine_deleted table
                const { data: deletedData, error: deletedError } = await supabase
                    .from('medicine_deleted')
                    .insert({
                        medicine_stock_in_id: medicineToDelete.medicine_stock_in_id,
                        quantity: currentQuantity, // Remove entire stock
                        description: reason,
                        deleted_at: new Date().toISOString()
                    })
                    .select();

                if (deletedError) {
                    console.error('Error recording medicine deletion:', deletedError);
                    alert('Failed to record medicine deletion. Please try again.');
                    return;
                }

                // Step 2: Set quantity to 0 in the medicine_stock_in table (complete removal)
                const { data: stockData, error: stockError } = await supabase
                    .from('medicine_stock_in')
                    .update({ quantity: 0 })
                    .eq('medicine_stock_in_id', medicineToDelete.medicine_stock_in_id);

                if (stockError) {
                    console.error('Error updating medicine quantity:', stockError);
                    
                    // Try to rollback the deletion record if stock update fails
                    if (deletedData && deletedData[0]) {
                        await supabase
                            .from('medicine_deleted')
                            .delete()
                            .eq('medicine_deleted_id', deletedData[0].medicine_deleted_id);
                    }
                    
                    alert('Failed to update medicine quantity. Transaction has been rolled back.');
                    return;
                }

                console.log('Successfully removed medicine:', { deleted: deletedData, stock: stockData });
                
                // Step 3: Log the activity in history_log table
                if (deletedData && deletedData[0]) {
                    const { error: historyError } = await supabase
                        .from('history_log')
                        .insert({
                            user_id: UserService.getCurrentUser()?.user_id,
                            medicine_deleted_id: deletedData[0].medicine_deleted_id,
                            logged_at: new Date().toISOString()
                        });

                    if (historyError) {
                        console.error('Error logging removal activity to history:', historyError);
                        // Don't fail the main operation for history logging error
                    }
                }
                
                // Show success message
                alert(`Successfully removed ${currentQuantity} units of ${medicineToDelete.medicine?.medicine_name}. Medicine has been completely removed from inventory.`);

                setMedicineToDelete(null);
                // Reload data after removal
                await loadInventoryData();
            } catch (error) {
                console.error('Unexpected error during medicine removal:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleOpenDispenseModal = (record: StockIn) => {
        setMedicineToDispense(record);
        setDispenseModalOpen(true);
    };

    const handleConfirmDispense = async (quantity: number) => {
        if (medicineToDispense) {
            try {
                const currentQuantity = medicineToDispense.quantity || 0;
                const newQuantity = currentQuantity - quantity;

                console.log(`Dispensing ${quantity} of ${medicineToDispense.medicine?.medicine_name}. Current: ${currentQuantity}, New: ${newQuantity}`);

                if (newQuantity < 0) {
                    alert('Cannot dispense more than available quantity');
                    return;
                }

                // Get current user for the transaction record
                const currentUser = UserService.getCurrentUser();
                if (!currentUser || !currentUser.user_id) {
                    alert('User session expired. Please log in again.');
                    return;
                }

                // Step 1: Record the dispense transaction in medicine_stock_out table
                const { data: stockOutData, error: stockOutError } = await supabase
                    .from('medicine_stock_out')
                    .insert({
                        medicine_stock_in_id: medicineToDispense.medicine_stock_in_id,
                        quantity_dispensed: quantity,
                        user_id: currentUser.user_id,
                        timestamp_dispensed: new Date().toISOString()
                    })
                    .select();

                if (stockOutError) {
                    console.error('Error recording dispense transaction:', stockOutError);
                    alert('Failed to record dispense transaction. Please try again.');
                    return;
                }

                // Step 2: Update the quantity in the medicine_stock_in table
                const { data: stockInData, error: stockInError } = await supabase
                    .from('medicine_stock_in')
                    .update({ quantity: newQuantity })
                    .eq('medicine_stock_in_id', medicineToDispense.medicine_stock_in_id);

                if (stockInError) {
                    console.error('Error updating medicine quantity:', stockInError);
                    
                    // Try to rollback the stock_out record if stock_in update fails
                    if (stockOutData && stockOutData[0]) {
                        await supabase
                            .from('medicine_stock_out')
                            .delete()
                            .eq('medicine_stock_out_id', stockOutData[0].medicine_stock_out_id);
                    }
                    
                    alert('Failed to update medicine quantity. Transaction has been rolled back.');
                    return;
                }

                // Step 3: Log the activity in history_log table
                if (stockOutData && stockOutData[0]) {
                    const { error: historyError } = await supabase
                        .from('history_log')
                        .insert({
                            user_id: currentUser.user_id,
                            medicine_stock_out_id: stockOutData[0].medicine_stock_out_id,
                            logged_at: new Date().toISOString()
                        });

                    if (historyError) {
                        console.error('Error logging activity to history:', historyError);
                        // Don't fail the main operation for history logging error
                    }
                }

                console.log('Successfully dispensed medicine:', { stockOut: stockOutData, stockIn: stockInData });
                
                // Show success message
                if (newQuantity === 0) {
                    alert(`Successfully dispensed ${quantity} units. Medicine is now out of stock.`);
                } else {
                    alert(`Successfully dispensed ${quantity} units. Remaining quantity: ${newQuantity}`);
                }

                setMedicineToDispense(null);
                // Reload data after dispensing
                await loadInventoryData();
            } catch (error) {
                console.error('Unexpected error during dispensing:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };
    
    const handleOpenReorderModal = (record: StockIn) => {
        setMedicineToReorder(record);
        setReorderModalOpen(true);
    };

    const handleConfirmReorder = async (formData: SubmittedMedicineData) => {
        if (medicineToReorder) {
            try {
                const currentUser = UserService.getCurrentUser();
                if (!currentUser || !currentUser.user_id) {
                    alert('User session expired. Please log in again.');
                    return;
                }

                console.log(`Reordering ${medicineToReorder.medicine?.medicine_name}`, formData);

                // Get the medicine_id from the current medicine being reordered
                const medicine_id = medicineToReorder.medicine_id;

                if (!medicine_id) {
                    alert('Medicine ID not found. Cannot proceed with reorder.');
                    return;
                }

                // Insert new stock record into medicine_stock_in table
                const { data, error } = await supabase
                    .from('medicine_stock_in')
                    .insert([
                        {
                            medicine_id: medicine_id,
                            quantity: formData.quantity,
                            date_received: formData.dateReceived,
                            expiration_date: formData.expirationDate,
                            user_id: currentUser.user_id
                        }
                    ])
                    .select();

                if (error) {
                    console.error('Error adding new medicine stock:', error);
                    alert('Failed to add new medicine stock. Please try again.');
                    return;
                }

                console.log('Successfully added new medicine stock:', data);
                
                // Set the newly added record for highlighting
                if (data && data.length > 0) {
                    setNewlyAddedRecordId(data[0].medicine_stock_in_id);
                    
                    // Clear highlighting after 3 seconds
                    setTimeout(() => {
                        setNewlyAddedRecordId(null);
                    }, 3000);
                }

                // Show success message
                alert(`Successfully added ${formData.quantity} units of ${formData.medicineName} to inventory.`);

                setMedicineToReorder(null);
                // Reload data after reordering
                await loadInventoryData();
            } catch (error) {
                console.error('Unexpected error during reorder:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleAddMedicineSubmit = async (medicineData: MedicineFormData) => {
        const currentUser = UserService.getCurrentUser();
        if (!currentUser || !currentUser.user_id) {
            alert('Please log in to add medicines. User session not found.');
            console.error('No current user or user_id:', currentUser);
            return;
        }

        console.log('Current user:', currentUser);
        
        setIsLoading(true);
        try {
            console.log('Adding medicine with data:', medicineData);
            
            // Validate required fields
            if (!medicineData.medicineName || !medicineData.category || !medicineData.quantity || !medicineData.dateReceived || !medicineData.expirationDate) {
                throw new Error('All fields are required');
            }
            
            // First, check if medicine already exists
            let medicineId: number;
            const { data: existingMedicine } = await supabase
                .from('medicines')
                .select('medicine_id')
                .eq('medicine_name', medicineData.medicineName)
                .eq('medicine_category', medicineData.category)
                .single();

            if (existingMedicine) {
                console.log('Medicine already exists, using ID:', existingMedicine.medicine_id);
                medicineId = existingMedicine.medicine_id;
            } else {
                console.log('Creating new medicine...');
                // Create new medicine
                const { data: newMedicine, error: medicineError } = await supabase
                    .from('medicines')
                    .insert({
                        medicine_name: medicineData.medicineName,
                        medicine_category: medicineData.category
                    })
                    .select('medicine_id')
                    .single();

                if (medicineError) {
                    console.error('Error creating medicine:', medicineError);
                    throw medicineError;
                }
                
                console.log('New medicine created with ID:', newMedicine.medicine_id);
                medicineId = newMedicine.medicine_id;
            }

            console.log('Adding stock record...');
            // Add stock in record
            const stockData = {
                medicine_id: medicineId,
                quantity: parseInt(medicineData.quantity.toString()),
                date_received: medicineData.dateReceived,
                expiration_date: medicineData.expirationDate,
                user_id: currentUser.user_id
            };
            
            console.log('Stock data to insert:', stockData);
            
            const { data: newStockRecord, error: stockError } = await supabase
                .from('medicine_stock_in')
                .insert(stockData)
                .select('medicine_stock_in_id')
                .single();

            if (stockError) {
                console.error('Error adding stock record:', stockError);
                throw stockError;
            }

            console.log('Medicine and stock added successfully!');
            
            // Close modal and reload data
            setAddMedicineModalOpen(false);
            
            // Set the newly added record ID for highlighting
            if (newStockRecord) {
                setNewlyAddedRecordId(newStockRecord.medicine_stock_in_id);
                
                // Clear the highlight after 3 seconds
                setTimeout(() => {
                    setNewlyAddedRecordId(null);
                }, 3000);
            }
            
            await loadInventoryData();
            
            // Show success message
            alert(`Medicine "${medicineData.medicineName}" has been successfully added to the inventory!`);
            
        } catch (error) {
            console.error('Error adding medicine:', error);
            
            // Show detailed error message
            let errorMessage = 'Failed to add medicine. ';
            if (error instanceof Error) {
                errorMessage += error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage += (error as any).message;
            } else {
                errorMessage += 'Please try again.';
            }
            
            // Check if it's an RLS error and provide helpful message
            if (errorMessage.includes('row-level security policy')) {
                errorMessage = 'Database access denied. Please contact your administrator to configure table permissions.';
            }
            
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredStockRecords = (): StockIn[] => {
        const filtered = stockInRecords.filter(record => {
            const medicine = record.medicine;
            const medicineName = medicine?.medicine_name?.toLowerCase() || '';
            const medicineCategory = medicine?.medicine_category?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            // Filter out medicines with zero or negative quantity (removed medicines)
            const hasQuantity = (record.quantity || 0) > 0;
            
            // Apply search filter
            const matchesSearch = medicineName.includes(searchLower) || medicineCategory.includes(searchLower);
            
            return hasQuantity && matchesSearch;
        });
        
        console.log('Total stock records:', stockInRecords.length);
        console.log('Records with quantity > 0:', stockInRecords.filter(r => (r.quantity || 0) > 0).length);
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
                                                {stockInRecords.length === 0 
                                                    ? 'No medicines in inventory yet. Click "ADD MEDICINE" to add your first medicine.' 
                                                    : `No medicines found matching "${searchTerm}". Total medicines in inventory: ${stockInRecords.length}`
                                                }
                                            </td>
                                        </tr>
                                    ) : (
                                        getFilteredStockRecords().map((record) => (
                                            <tr 
                                                key={record.medicine_stock_in_id} 
                                                className={`hover:bg-gray-50 transition-colors duration-300 ${
                                                    newlyAddedRecordId === record.medicine_stock_in_id 
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
                                                    {record.date_received ? new Date(record.date_received).toLocaleDateString() : '2025-08-26'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {record.expiration_date ? new Date(record.expiration_date).toLocaleDateString() : '2027-03-25'}
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
