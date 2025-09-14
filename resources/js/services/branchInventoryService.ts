import { supabase } from '../lib/supabaseClient'

// Interfaces remain the same
export interface Medicine {
    medicine_id: number
    medicine_name: string
    medicine_category?: string
    category: string
    quantity?: number
    expiry: string
}

export interface MedicineStockIn {
    medicine_stock_in_id: number
    medicine_id: number
    branch_id: number
    quantity: number
    lot_number: string
    expiration_date: string
    timestamp_dispensed: string
    date_received?: string
    user_id: number
    medicine?: Medicine
}

export interface User {
    user_id: number
    name: string
    email: string
}

export interface Branch {
    branch_id: number
    branch_name: string
    address?: string
    location?: string  // Keep this for backward compatibility
}

export interface BranchInventoryItem {
    medicine_stock_in_id: number
    medicine_id: number
    medicine_name: string
    category: string
    quantity: number
    lot_number: string
    expiration_date: string
    timestamp_dispensed: string
    date_received?: string
    user_id: number
    medicine?: Medicine
}

export interface BranchStockSummary {
    medicine_name: string
    category: string
    quantity: number
    reorder_level: number
    branch_name: string
    branch_id: number
}

export interface MedicineDeletedRequest {
    medicineStockInId: number
    quantity: number
    description: string
    branchId: number
}

export interface DispenseRequest {
    medicineStockInId: number
    quantity: number
    reason?: string
    dispensedBy: number
}

export class BranchInventoryService {
    // Working MSSQL methods
    static async getAllMedicines(): Promise<Medicine[]> {
        try {
            const response = await fetch('/api/medicines', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching medicines:', error);
            return [];
        }
    }

    static async createMedicine(medicineName: string, category: string): Promise<Medicine> {
        try {
            const medicine = {
                medicine_name: medicineName,
                category: category,
                expiry: new Date().toISOString() // Default expiry
            };

            const response = await fetch('/api/medicines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(medicine),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating medicine:', error);
            throw error;
        }
    }

    static async dispenseMedicineStockOut(request: DispenseRequest & { branchId: number }): Promise<any> {
        try {
            const response = await fetch('/api/dispense-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_stock_in_id: request.medicineStockInId,
                    quantity_dispensed: request.quantity,
                    user_id: request.dispensedBy,
                    branch_id: request.branchId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error dispensing medicine:', error);
            throw error;
        }
    }

    static async deleteMedicine(request: MedicineDeletedRequest): Promise<any> {
        try {
            const response = await fetch('/api/medicines/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_stock_in_id: request.medicineStockInId,
                    quantity: request.quantity,
                    description: request.description,
                    branch_id: request.branchId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting medicine:', error);
            throw error;
        }
    }

    // Working inventory fetch method (MSSQL version)
    static async getBranchInventory(branchId: number): Promise<BranchInventoryItem[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/inventory`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching branch inventory:', error);
            return [];
        }
    }

    static async getStockSummary(branchId: number): Promise<BranchStockSummary[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/stock-summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching stock summary:', error);
            return [];
        }
    }

    // Working MSSQL API methods for branch management
    
    // Get user's branch information
    static async getUserBranchInfo(userId: number): Promise<Branch | null> {
        try {
            const response = await fetch(`/api/users/${userId}/branch`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user branch info:', error);
            return null;
        }
    }

    // Get all branches except the specified one
    static async getOtherBranches(excludeBranchId: number): Promise<Branch[]> {
        try {
            const response = await fetch(`/api/branches/other/${excludeBranchId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching other branches:', error);
            return [];
        }
    }

    // Get all branches
    static async getAllBranches(): Promise<Branch[]> {
        try {
            const response = await fetch('/api/branches', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching all branches:', error);
            return [];
        }
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async dispenseMedicineByMedicineId(medicineId: number, quantity: number, reason: string, dispensedBy: number): Promise<boolean> {
        console.warn('BranchInventoryService.dispenseMedicineByMedicineId is deprecated. Use dispenseMedicineStockOut instead.');
        return false;
    }

    static async addMedicineStockIn(
        medicineId: number,
        branchId: number,
        quantity: number,
        dateReceived: string,
        expirationDate: string,
        userId: number
    ): Promise<MedicineStockIn | null> {
        try {
            const response = await fetch('/api/medicine-stock-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_id: medicineId,
                    branch_id: branchId,
                    quantity: quantity,
                    date_received: dateReceived,
                    expiration_date: expirationDate,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding medicine stock in:', error);
            throw error;
        }
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getLowStockMedicines(branchId: number): Promise<BranchStockSummary[]> {
        console.warn('BranchInventoryService.getLowStockMedicines is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getBranchStockInRecords(branchId: number): Promise<MedicineStockIn[]> {
        console.warn('BranchInventoryService.getBranchStockInRecords is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getBranchStockOutRecords(branchId: number): Promise<any[]> {
        console.warn('BranchInventoryService.getBranchStockOutRecords is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getAvailableStockForMedicine(medicineId: number): Promise<any[]> {
        console.warn('BranchInventoryService.getAvailableStockForMedicine is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getDeletedMedicines(): Promise<any[]> {
        console.warn('BranchInventoryService.getDeletedMedicines is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async checkTableExists(tableName: string): Promise<boolean> {
        console.warn('BranchInventoryService.checkTableExists is deprecated. Use MSSQL API endpoint instead.');
        return false;
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getMedicineStockInById(medicineStockInId: number): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.getMedicineStockInById is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async updateMedicineStockIn(
        medicineStockInId: number,
        updates: Partial<MedicineStockIn>
    ): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.updateMedicineStockIn is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async addMedicineStock(
        medicineId: number,
        branchId: number,
        quantity: number,
        lotNumber: string,
        expirationDate: string,
        userId: number
    ): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.addMedicineStock is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }

    // @deprecated - Legacy fallback method no longer needed
    static async addMedicineFallback(
        medicineId: number,
        branchId: number,
        quantity: number,
        dateReceived?: string,
        expirationDate?: string
    ): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.addMedicineFallback is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }
}