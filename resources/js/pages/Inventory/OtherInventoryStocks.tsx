import React, { useState, useEffect } from "react";
import RequestMedicineModal from '../../components/RequestMedicineModal';
import OtherInventoryTable from '../../components/OtherInventoryTable';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Search,
    Menu
} from 'lucide-react';
import { BranchInventoryService } from '../../services/branchInventoryService';
import { UserService } from '../../services/userService';
import type { BranchInventoryItem } from '../../services/branchInventoryService';





import { usePage } from '@inertiajs/react';

const OtherBranchInventoryPage: React.FC = () => {
    // Get branchId from Inertia page props (from route param)
    const { branchId } = usePage().props as unknown as { branchId: number };
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);


    // Define dateTime state
    type DateTimeData = { date: string; time: string };
    const [dateTime, setDateTime] = useState<DateTimeData>(() => getCurrentDateTime());
    // Minimal branch shape for display
    type SimpleBranch = { id: number; name: string; suffix?: string };
    const [branch, setBranch] = useState<SimpleBranch | null>(null);

    const [medicines, setMedicines] = useState<BranchInventoryItem[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);
    // State to show request modal
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);

    
    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];


    useEffect(() => {
        const loadInventories = async () => {
            if (!branchId) return;
            setInventoryLoading(true);
            setInventoryError(null);
            try {
                // Ensure user is logged in and has branch info
                const currentUser = UserService.getCurrentUser();
                if (!currentUser || !currentUser.branch_id) {
                    // If no user session, redirect to login/home
                    router.visit('/');
                    return;
                }

                // Get other branch inventory from backend (MSSQL)
                const otherInventory = await BranchInventoryService.getBranchInventory(branchId);

                // Get current user's branch inventory from backend
                const userInventory = await BranchInventoryService.getBranchInventory(currentUser.branch_id);

                // Enrich other branch inventory rows with info from the user's branch (if any)
                const userById = new Map<number, BranchInventoryItem>();
                const userByName = new Map<string, BranchInventoryItem>();
                userInventory.forEach(u => {
                    const id = Number(u.medicine_id || 0);
                    if (!Number.isNaN(id) && id > 0) userById.set(id, u);
                    if (u.medicine_name) userByName.set(u.medicine_name.toString().toLowerCase(), u);
                });


                    // Helper: normalize medicine names to improve grouping (lowercase, remove punctuation, collapse spaces)
                    const normalizeName = (s: string) => {
                        if (!s) return '';
                        try {
                            return s.toString()
                                .normalize('NFKC')
                                .toLowerCase()
                                .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation
                                .replace(/\s+/g, ' ') // collapse spaces
                                .trim();
                        } catch (e) {
                            return s.toString().toLowerCase().trim();
                        }
                    };

                    // Aggregate otherInventory rows primarily by normalized medicine name so same-name medicines merge,
                    // fallback to id-based grouping when name is missing. Sum quantities, take latest date_received, earliest expiration_date.
                    const agg = new Map<string, any>();
                    otherInventory.forEach((row: any) => {
                        const rawName = (row.medicine_name || row.name || '').toString();
                        const normalized = normalizeName(rawName);
                        const nameKey = normalized ? `name:${normalized}` : null;
                        const id = Number(row.medicine_id || 0);
                        const key = nameKey || `id:${id}`;

                        const qty = Number(row.quantity ?? row.remaining_stock ?? 0);
                        const dateReceived = row.date_received || row.dateReceived || '';
                        const expiry = row.expiration_date || row.expirationDate || '';

                        let entry = agg.get(key);
                        if (!entry) {
                            entry = {
                                medicine_ids: new Set<number>(),
                                medicine_id: id > 0 ? id : 0,
                                medicine_name: rawName || row.medicine_name || '',
                                categories: new Set<string>(),
                                category: row.category || row.medicine_category || '',
                                quantity: qty,
                                date_received: dateReceived,
                                expiration_date: expiry,
                            };
                            const cat = (row.category || row.medicine_category || '').toString().trim();
                            if (cat) entry.categories.add(cat);
                            if (id > 0) entry.medicine_ids.add(id);
                            agg.set(key, entry);
                        } else {
                            entry.quantity = Number(entry.quantity || 0) + qty;
                            if (id > 0) entry.medicine_ids.add(id);
                            // latest date_received
                            if (dateReceived && (!entry.date_received || new Date(dateReceived) > new Date(entry.date_received))) {
                                entry.date_received = dateReceived;
                            }
                            // earliest expiration_date
                            if (expiry) {
                                if (!entry.expiration_date) entry.expiration_date = expiry;
                                else if (new Date(expiry) < new Date(entry.expiration_date)) entry.expiration_date = expiry;
                            }
                            // collect categories, even if different
                            const cat = (row.category || row.medicine_category || '').toString().trim();
                            if (cat) entry.categories.add(cat);
                            // update displayed category: if multiple categories exist, mark as 'Multiple'
                            if (entry.categories.size > 1) entry.category = 'Multiple';
                            else if (entry.categories.size === 1) entry.category = Array.from(entry.categories)[0];
                        }
                    });

                    const aggregated = Array.from(agg.values()).map((v: any) => ({
                        medicine_stock_in_id: 0,
                        // prefer a real id if available, otherwise 0
                        medicine_id: v.medicine_id || (v.medicine_ids && Array.from(v.medicine_ids)[0]) || 0,
                        medicine_name: v.medicine_name,
                        category: v.category,
                        quantity: v.quantity,
                        lot_number: '',
                        expiration_date: v.expiration_date,
                        timestamp_dispensed: '',
                        date_received: v.date_received,
                        user_id: 0
                    } as BranchInventoryItem));

                    setMedicines(aggregated);

                // Build sets of medicine ids and names the user has in their branch (coerce ids to Number)
                const userMedicineIds = new Set<number>();
                const userMedicineNames = new Set<string>();
                userInventory.forEach(i => {
                    const id = Number(i.medicine_id || i.medicine_id === 0 ? i.medicine_id : NaN);
                    if (!Number.isNaN(id) && id > 0) userMedicineIds.add(id);
                    if (i.medicine_name) userMedicineNames.add(i.medicine_name.toString().toLowerCase());
                });

                console.debug('OtherInventory count:', otherInventory.length, 'UserInventory count:', userInventory.length);
                console.debug('User medicine ids sample:', Array.from(userMedicineIds).slice(0,10));
                console.debug('User medicine names sample:', Array.from(userMedicineNames).slice(0,10));
                // Clear inventoryError unless the other branch has no medicines
                if (!otherInventory || otherInventory.length === 0) {
                    setInventoryError('There are no medicines listed for the selected branch.');
                } else {
                    setInventoryError(null);
                }

                // Set branch basic info (name) if available from API payload or fallback
                // Fetch branch metadata to display name (backend route exists)
                try {
                    const resp = await fetch(`/api/branches/${branchId}`, { method: 'GET' });
                    if (resp.ok) {
                        const branchData = await resp.json();
                        // backend might return { branch_id, branch_name }
                        const displayName = branchData.branch_name || branchData.name || branchData.branchName || `Branch ${branchId}`;
                        setBranch({ id: branchId, name: displayName, suffix: '' });
                    } else {
                        setBranch({ id: branchId, name: `Branch ${branchId}`, suffix: '' });
                    }
                } catch (e) {
                    setBranch({ id: branchId, name: `Branch ${branchId}`, suffix: '' });
                }
            } catch (err: any) {
                console.error('Error loading inventories:', err);
                setInventoryError(err?.message || 'Failed to load inventories from the server');
                // fallback to route back
                // router.visit('/inventory/stocks');
            } finally {
                setInventoryLoading(false);
            }
        };

        loadInventories();
    }, [branchId]);

    function getCurrentDateTime(): DateTimeData {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        return { date, time };
    }
        
    useEffect(() => {
        const timer = setInterval(() => setDateTime(getCurrentDateTime()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => router.visit(path);

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const handleBackToStocks = (): void => router.visit('/inventory/stocks');

    // Get medicines with stock > 40 for dropdown (map API quantity to stock)
    const eligibleMedicines = medicines.filter(med => (med.quantity ?? 0) > 40);

    const handleRequestMedicine = (): void => {
        setRequestModalOpen(true);
    };



    const getFilteredAndSortedMedicines = (): BranchInventoryItem[] => {
        let processed = medicines.filter(med => {
            const name = (med.medicine_name || '').toString().toLowerCase();
            const category = (med.category || '').toString().toLowerCase();
            return name.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase());
        });
        return processed.sort((a, b) => new Date((a.expiration_date || '') as string).getTime() - new Date((b.expiration_date || '') as string).getTime());
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    if (!branch) {
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <p className="text-gray-500 text-lg">Loading branch data...</p>
            </div>
        );
    }

    // Handler for request modal submission
    const handleRequestSubmit = (data: { medicineId: number; expirationDate: string; quantity: number }) => {
        setRequestModalOpen(false);
        // TODO: handle request logic (API call, UI update, etc.)
    };

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
                                <h2 className="text-xl font-medium text-black mb-1">Other Branch - Stock Available List</h2>
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
                        {/* Table for Other Branches */}
                        {inventoryLoading ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-600">Loading inventories...</p>
                            </div>
                        ) : inventoryError ? (
                            <div className="py-6 text-center">
                                <p className="text-red-500">{inventoryError}</p>
                            </div>
                        ) : (
                            <>
                                <OtherInventoryTable medicines={getFilteredAndSortedMedicines()} searchTerm={searchTerm} />
                                <div className="flex justify-end mt-8 flex-shrink-0">
                                    <button onClick={handleRequestMedicine} className="bg-[#a3386c] hover:bg-[#8a2f5a] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 cursor-pointer transform hover:scale-105">
                                        REQUEST MEDICINE
                                    </button>
                                </div>
                                {/* Debug panel removed; table shows selected branch enriched with user data */}
                            </>
                        )}

                        {/* Request Medicine Modal */}
                        <RequestMedicineModal
                            isOpen={isRequestModalOpen}
                            setIsOpen={setRequestModalOpen}
                            branchId={branchId}
                            medicineOptions={medicines}
                            onRequest={handleRequestSubmit}
                        />
                    </div>
                </main>
            </div>
        </div>

    );
};

export default OtherBranchInventoryPage;
