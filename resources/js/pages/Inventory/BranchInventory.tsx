import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import AddMedicineModal from '../../components/AddMedicineModal';
import RemovalReasonModal from '../../components/RemovalReasonModal';
import DispenseMedicineModal from '../../components/DispenseMedicineModal';
import ReorderMedicineModal from '../../components/ReorderMedicineModal';
import { router } from '@inertiajs/react';
import { ArrowLeft, Search, Menu, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { UserService } from '../../services/userService';
import { NotificationService } from '../../services/notificationService';
import { BranchInventoryService, BranchInventoryItem, Branch, Medicine, MedicineDeletedRequest } from '../../services/branchInventoryService';
import { HistoryLogService } from '../../services/HistoryLogService';

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
    const [selectedGroupForDispense, setSelectedGroupForDispense] = useState<any | null>(null);
    const [isArchivedModalOpen, setArchivedModalOpen] = useState(false);
    const [archivedMedicines, setArchivedMedicines] = useState<any[]>([]);

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
            
            // Get user's branch info - use current user's branch data first, then API as fallback
            let branchInfo;
            if (user.branch_id && user.branch_name) {
                branchInfo = {
                    branch_id: user.branch_id,
                    branch_name: user.branch_name,
                    address: undefined, // Will be populated by API if available
                    location: undefined // Keep for backward compatibility
                };
                console.log('Using user branch data:', branchInfo);
            } else {
                // Fallback to API call if branch info not in user data
                branchInfo = await BranchInventoryService.getUserBranchInfo(user.user_id);
                if (!branchInfo) {
                    console.warn('Could not fetch user branch info, using fallback data');
                    branchInfo = {
                        branch_id: 1,
                        branch_name: 'System Branch',
                        address: 'Error loading branch data'
                    };
                }
                console.log('Using API branch data:', branchInfo);
            }
            
            setBranchInfo(branchInfo);
            console.log('Final branch info:', branchInfo);
            
            // Load medicines for the dropdown/reference
            const medicines = await BranchInventoryService.getAllMedicines();
            setMedicines(medicines);
            
            // Load branch inventory
            const inventory = await BranchInventoryService.getBranchInventory(branchInfo.branch_id);
            setBranchInventory(inventory);
            
            console.log('Branch inventory loaded:', inventory);
            
        } catch (error) {
            console.error('Error loading inventory data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Failed to load inventory data',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadArchivedMedicines = async () => {
        if (!branchInfo) return;
        try {
            const data = await BranchInventoryService.getArchivedMedicines(branchInfo.branch_id);
            if (!data || data.length === 0) {
                // fallback mock for dev
                setArchivedMedicines([
                    { id: 1, medicine_name: 'Paracetamol', medicine_category: 'Analgesic', date_received: '2025-08-01', expiration_date: '2027-08-01', quantity: 10, description: 'Damaged packaging' },
                    { id: 2, medicine_name: 'Amoxicillin', medicine_category: 'Antibiotic', date_received: '2025-06-10', expiration_date: '2026-06-10', quantity: 0, description: 'Expired' }
                ]);
            } else {
                setArchivedMedicines(data);
            }
        } catch (error) {
            console.error('Failed to load archived medicines:', error);
            setArchivedMedicines([
                { id: 1, medicine_name: 'Paracetamol', medicine_category: 'Analgesic', date_received: '2025-08-01', expiration_date: '2027-08-01', quantity: 10, description: 'Damaged packaging' },
            ]);
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
    
    const handleConfirmRemoval = async (reason: string, dateReceived?: string | null, expirationDate?: string | null) => {
        if (medicineToDelete !== null && branchInfo && currentUser) {
            try {
                console.log('=== REMOVAL DEBUG START ===');
                console.log('Medicine to delete:', medicineToDelete);
                console.log('Branch info:', branchInfo);
                console.log('Current user:', currentUser);
                
                // Database connectivity tests removed - now using MSSQL API
                console.log('Using MSSQL API - no direct database connectivity tests needed');

                const currentQuantity = medicineToDelete.quantity || 0;
                
                // Check if we have medicine_stock_in_id (for individual stock record archiving)
                if (medicineToDelete.medicine_stock_in_id) {
                    console.log('Using archive flow for stock record');
                    console.log('Stock record ID:', medicineToDelete.medicine_stock_in_id);
                    console.log('Quantity to archive:', currentQuantity);

                    const success = await BranchInventoryService.archiveMedicine({
                        medicineStockInId: medicineToDelete.medicine_stock_in_id,
                        quantity: currentQuantity,
                        description: reason || 'Medicine archived from inventory',
                        branchId: branchInfo.branch_id,
                        dateReceived: dateReceived || medicineToDelete.date_received || null,
                        expirationDate: expirationDate || medicineToDelete.expiration_date || null
                    });

                    if (!success) {
                        console.error('❌ Archiving failed');
                        Swal.fire({
                            icon: 'error',
                            title: 'Archive Failed',
                            text: 'Failed to archive medicine. Please check the console for details and try again.',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }

                    console.log('✅ Archiving succeeded');
                    // history handled by DB triggers
                    // Refresh archived list if modal is open
                    if (isArchivedModalOpen) await loadArchivedMedicines();
                } else {
                    console.log('❌ No medicine_stock_in_id found, cannot archive individual record');
                    Swal.fire({
                        icon: 'error',
                        title: 'Cannot Archive Medicine',
                        text: 'Cannot archive medicine: missing stock record ID. Please refresh the page and try again.',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                console.log('✅ Successfully removed medicine from branch inventory');
                
                // Show success alert after successful deletion
                Swal.fire({
                    icon: 'success',
                    title: 'Medicine Removed Successfully',
                    text: `${medicineToDelete?.medicine_name || 'Medicine'} has been successfully removed from inventory.`,
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true
                });

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
                Swal.fire({
                    icon: 'error',
                    title: 'Unexpected Error',
                    text: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`,
                    confirmButtonText: 'OK'
                });
            }
        } else {
            console.error('❌ Missing required data for deletion:', {
                medicineToDelete: !!medicineToDelete,
                branchInfo: !!branchInfo,
                currentUser: !!currentUser
            });
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Missing required information. Please refresh the page and try again.',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleOpenDispenseModal = (record: BranchInventoryItem) => {
        setMedicineToDispense(record);
        setDispenseModalOpen(true);
    };

    const handleConfirmDispense = async (medicineStockInId: number, quantity: number) => {
        if (!branchInfo || !currentUser) {
            Swal.fire({ icon: 'error', title: 'Missing Data', text: 'User or branch information is missing.' });
            return;
        }
        try {
            // Use the new stock out system for the specific batch
            const result = await BranchInventoryService.dispenseMedicineStockOut({
                medicineStockInId: medicineStockInId,
                quantity: quantity,
                dispensedBy: currentUser.user_id,
                branchId: branchInfo.branch_id
            });

            if (!result || !result.success) {
                Swal.fire({ icon: 'error', title: 'Dispense Failed', text: 'Failed to dispense medicine. Please try again.' });
                return;
            }

            Swal.fire({ icon: 'success', title: 'Medicine Dispensed Successfully!', text: `${quantity} units dispensed.`, timer: 2500, showConfirmButton: false });
            setSelectedGroupForDispense(null);
            setDispenseModalOpen(false);
            await loadInventoryData();
        } catch (error) {
            console.error('Unexpected error during dispensing:', error);
            let errorMessage = 'An unexpected error occurred.';
            if (error instanceof Error) errorMessage = error.message;
            Swal.fire({ icon: 'error', title: 'Dispense Failed', text: errorMessage });
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
                    formData.quantity,
                    formData.dateReceived,
                    formData.expirationDate,
                    currentUser.user_id
                );

                if (!stockInRecord) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Add Stock Failed',
                        text: 'Failed to add new medicine stock. Please try again.',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                console.log('Successfully created new stock in record:', stockInRecord);
                
                // History logging is now handled by database triggers
                // No need for manual logging here
                
                // Show success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Medicine Restocked Successfully!',
                    text: `${formData.quantity} units of ${medicineToReorder.medicine?.medicine_name} have been added to inventory.`,
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true
                });

                setMedicineToReorder(null);
                // Reload data to show the new separate entry
                await loadInventoryData();
            } catch (error) {
                console.error('Unexpected error during reorder:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Unexpected Error',
                    text: 'An unexpected error occurred. Please try again.',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleAddMedicineSubmit = async (medicineData: MedicineFormData) => {
        if (!currentUser || !branchInfo) {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Required',
                text: 'Please log in and ensure you are assigned to a branch.',
                confirmButtonText: 'OK'
            });
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
                parseInt(medicineData.quantity.toString()),
                medicineData.dateReceived,
                medicineData.expirationDate,
                currentUser.user_id
            );

            if (!stockInRecord) {
                throw new Error('Failed to add medicine to inventory using stock in system');
            }

            console.log('Medicine and stock added successfully using stock in system!');
            
            // History logging is now handled by database triggers
            // No need for manual logging here
            
            // Close modal and reload data
            setAddMedicineModalOpen(false);
            await loadInventoryData();
            
            // Show success alert
            Swal.fire({
                icon: 'success',
                title: 'Medicine Added Successfully!',
                text: `${medicineData.medicineName} has been added to the inventory.`,
                confirmButtonText: 'OK',
                timer: 3000,
                timerProgressBar: true
            });
            
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
            
            Swal.fire({
                icon: 'error',
                title: 'Failed to Add Medicine',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
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

    // Group inventory records by medicine name to merge duplicates in the table
    const getGroupedInventory = () => {
        const filtered = getFilteredStockRecords();
        const groups: Record<string, any> = {};
        for (const rec of filtered) {
            const name = rec.medicine?.medicine_name || 'Unknown';
            if (!groups[name]) {
                groups[name] = {
                    medicine_name: name,
                    medicine_category: rec.medicine?.medicine_category || 'No Category',
                    total_quantity: 0,
                    batches: [] as any[],
                    representative: rec
                };
            }
            groups[name].total_quantity += rec.quantity || 0;
            groups[name].batches.push({
                medicine_stock_in_id: rec.medicine_stock_in_id,
                expiration_date: rec.expiration_date,
                date_received: rec.date_received,
                quantity: rec.quantity || 0
            });
        }
        return Object.values(groups);
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
                medicineOptions={medicines.map(m => m.medicine_name)}
                branchName={branchInfo?.branch_name}
            />
            <RemovalReasonModal
                isOpen={isRemovalModalOpen}
                setIsOpen={setRemovalModalOpen}
                onSubmit={async (description: string, medicineStockInId?: number | null, dateReceived?: string | null, expirationDate?: string | null) => {
                    // if a batch was selected, prefer its dates
                    await handleConfirmRemoval(description, dateReceived ?? null, expirationDate ?? null);
                }}
                currentStock={medicineToDelete?.quantity || 0}
                medicineName={medicineToDelete?.medicine?.medicine_name}
                medicineCategory={medicineToDelete?.medicine?.medicine_category}
                batchOptions={medicineToDelete ? [{
                    medicine_stock_in_id: medicineToDelete.medicine_stock_in_id || 0,
                    date_received: medicineToDelete.date_received || null,
                    expiration_date: medicineToDelete.expiration_date || null,
                    quantity: medicineToDelete.quantity || null
                }] : []}
            />
            {/* Archived Medicines Modal */}
            {isArchivedModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-black">Archived Medicines</h3>
                            <button onClick={() => setArchivedModalOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                        </div>
                        <div className="w-full overflow-auto max-h-[70vh]">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left text-sm text-gray-500 py-3">Name</th>
                                        <th className="text-left text-sm text-gray-500 py-3">Date Received</th>
                                        <th className="text-left text-sm text-gray-500 py-3">Expiration Date</th>
                                        <th className="text-left text-sm text-gray-500 py-3">Quantity</th>
                                        <th className="text-left text-sm text-gray-500 py-3">Reason</th>
                                        <th className="text-center text-sm text-gray-500 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivedMedicines.map((m) => (
                                        <tr key={m.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <Archive className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-blue-600">{m.medicine_name}</div>
                                                        <div className="text-sm text-gray-500">{m.medicine_category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm text-black">{m.archived_date_received ?? m.stock_date_received ?? m.date_received ?? m.dateReceived ?? 'N/A'}</td>
                                            <td className="py-3 text-sm text-black">{m.archived_expiration_date ?? m.stock_expiration_date ?? m.expiration_date ?? m.expirationDate ?? 'N/A'}</td>
                                            <td className="py-3 text-sm text-gray-500">{m.quantity ?? 0}</td>
                                            <td className="py-3 text-sm text-gray-500">{m.description || m.reason || 'N/A'}</td>
                                            <td className="py-3 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={async () => {
                                                        if (!branchInfo) return;
                                                        const ok = await BranchInventoryService.restoreArchivedMedicine(branchInfo.branch_id, m.id);
                                                        if (ok) {
                                                            await loadArchivedMedicines();
                                                            await loadInventoryData();
                                                        } else {
                                                            Swal.fire({ icon: 'error', title: 'Restore Failed', text: 'Could not restore medicine.' });
                                                        }
                                                    }} className="p-2 rounded-md bg-green-100 hover:bg-green-200 text-green-700 cursor-pointer" title="Unarchive">
                                                        <ArchiveRestore className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={async () => {
                                                        if (!branchInfo) return;
                                                        const ok = await BranchInventoryService.deleteArchivedMedicine(branchInfo.branch_id, m.id);
                                                        if (ok) await loadArchivedMedicines();
                                                        else Swal.fire({ icon: 'error', title: 'Delete Failed', text: 'Could not delete archived medicine.' });
                                                    }} className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-700 cursor-pointer" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {selectedGroupForDispense && (
                <DispenseMedicineModal
                    isOpen={isDispenseModalOpen}
                    setIsOpen={setDispenseModalOpen}
                    onSubmit={async (medicineStockInId: number, qty: number) => {
                        // delegate to existing handler which we'll adapt below
                        await handleConfirmDispense(medicineStockInId, qty);
                    }}
                    currentStock={selectedGroupForDispense.total_quantity || 0}
                    medicineName={selectedGroupForDispense.medicine_name || 'Unknown Medicine'}
                    medicineCategory={selectedGroupForDispense.medicine_category || 'No Category'}
                    batches={selectedGroupForDispense.batches}
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
                                        <th className="px-6 py-4 text-left font-bold">QUANTITY</th>
                                        <th className="px-6 py-4 text-center font-bold">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : getFilteredStockRecords().length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                {branchInventory.length === 0 
                                                    ? 'No medicines in inventory yet. Click "ADD MEDICINE" to add your first medicine.' 
                                                    : `No medicines found matching "${searchTerm}". Total medicines in inventory: ${branchInventory.length}`
                                                }
                                            </td>
                                        </tr>
                                    ) : (
                                        getGroupedInventory().map((group: any, idx: number) => (
                                            <tr 
                                                key={`${group.medicine_name}-${idx}`} 
                                                className={`hover:bg-gray-50 transition-colors duration-300 ${
                                                    newlyAddedRecordId === group.representative?.medicine_id 
                                                        ? 'bg-green-50 border-green-200' 
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 font-medium">
                                                        {group.medicine_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {group.medicine_category}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">
                                                    {group.total_quantity || 0}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button 
                                                            onClick={() => { setSelectedGroupForDispense(group); setDispenseModalOpen(true); }} 
                                                            className="bg-red-200 text-red-800 hover:bg-red-300 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors cursor-pointer" 
                                                            title="Dispense Medicine"
                                                        >
                                                            -
                                                        </button>
                                                        <button 
                                                            onClick={() => { setMedicineToReorder(group.representative); setReorderModalOpen(true); }} 
                                                            className="bg-green-200 text-green-800 hover:bg-green-300 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors cursor-pointer" 
                                                            title="Reorder/Add Stock"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            onClick={() => { setMedicineToDelete(group.representative); setRemovalModalOpen(true); }}
                                                            className="text-gray-500 hover:text-red-600 p-1 transition-colors rounded-full hover:bg-gray-100 hover:text-red-600 cursor-pointer flex items-center justify-center"
                                                            title="Archive:"
                                                            aria-label="Archive"
                                                        >
                                                            <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <Archive className="w-4 h-4 text-gray-700" />
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end mt-8 flex-shrink-0 space-x-3">
                            <button onClick={async () => { await loadArchivedMedicines(); setArchivedModalOpen(true); }} className="bg-gray-200 hover:bg-gray-300 text-black font-medium py-3 px-5 rounded-lg transition-colors duration-200 cursor-pointer">
                                Archived Medicines
                            </button>
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
