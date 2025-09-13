import { supabase } from '../lib/supabaseClient';

export interface HistoryLog {
    history_id: number;
    user_id: number;
    medicine_id?: number;
    medicine_stock_in_id?: number;
    medicine_stock_out_id?: number;
    medicine_deleted_id?: number;
    medicine_reorder_id?: number;
    action_type: 'ADD' | 'DISPENSE' | 'REMOVE' | 'REORDER';
    description: string;
    logged_at: string;
    // Related data
    user?: {
        user_id: number;
        name: string;
        email: string;
    };
    medicine?: {
        medicine_name: string;
        medicine_type: string;
    };
    medicine_stock_in?: {
        medicine_id: number;
        quantity: number;
        lot_number?: string;
        expiration_date?: string;
        medicine?: {
            medicine_name: string;
            medicine_type: string;
        };
    };
    medicine_stock_out?: {
        medicine_id: number;
        quantity_dispensed: number;
        timestamp_dispensed: string;
        medicine?: {
            medicine_name: string;
        };
    };
    medicine_deleted?: {
        medicine_id: number;
        quantity_deleted: number;
        reason_for_deletion: string;
        medicine_name: string;
    };
    medicine_reorder?: {
        medicine_id: number;
        quantity_requested: number;
        status: string;
        medicine?: {
            medicine_name: string;
        };
    };
}

export class HistoryLogService {
    // Log new medicine addition to the medicines table (new medicine types)
    static async logMedicineAdd(
        userId: number,
        medicineId: number,
        description: string
    ): Promise<boolean> {
        try {
            console.log('📝 Logging new medicine addition to history_log...');
            
            const { error } = await supabase
                .from('history_log')
                .insert({
                    user_id: userId,
                    medicine_id: medicineId, // Reference to medicines table for new medicine types
                    action_type: 'ADD',
                    description: description,
                    logged_at: new Date().toISOString()
                });

            if (error) {
                console.error('❌ Error logging medicine addition:', error);
                return false;
            }

            console.log('✅ Medicine addition logged successfully');
            return true;
        } catch (error) {
            console.error('❌ Unexpected error logging medicine addition:', error);
            return false;
        }
    }

    // Log medicine stock reorder/restock (adding inventory to existing medicines)
    static async logMedicineRestock(
        userId: number,
        medicineStockInId: number,
        description: string
    ): Promise<boolean> {
        try {
            console.log('📝 Logging medicine restock to history_log...');
            
            const { error } = await supabase
                .from('history_log')
                .insert({
                    user_id: userId,
                    medicine_stock_in_id: medicineStockInId,
                    action_type: 'REORDER', // This represents restocking existing medicines
                    description: description,
                    logged_at: new Date().toISOString()
                });

            if (error) {
                console.error('❌ Error logging medicine restock:', error);
                return false;
            }

            console.log('✅ Medicine restock logged successfully');
            return true;
        } catch (error) {
            console.error('❌ Unexpected error logging medicine restock:', error);
            return false;
        }
    }

    // Log medicine dispensing
    static async logMedicineDispense(
        userId: number,
        medicineStockOutId: number,
        description: string
    ): Promise<boolean> {
        try {
            console.log('📝 Logging medicine dispensing to history_log...');
            
            const { error } = await supabase
                .from('history_log')
                .insert({
                    user_id: userId,
                    medicine_stock_out_id: medicineStockOutId,
                    action_type: 'DISPENSE',
                    description: description,
                    logged_at: new Date().toISOString()
                });

            if (error) {
                console.error('❌ Error logging medicine dispensing:', error);
                return false;
            }

            console.log('✅ Medicine dispensing logged successfully');
            return true;
        } catch (error) {
            console.error('❌ Unexpected error logging medicine dispensing:', error);
            return false;
        }
    }

    // Log medicine removal
    static async logMedicineRemoval(
        userId: number,
        medicineDeletedId: number,
        description: string
    ): Promise<boolean> {
        try {
            console.log('📝 Logging medicine removal to history_log...');
            
            const { error } = await supabase
                .from('history_log')
                .insert({
                    user_id: userId,
                    medicine_deleted_id: medicineDeletedId,
                    action_type: 'REMOVE',
                    description: description,
                    logged_at: new Date().toISOString()
                });

            if (error) {
                console.error('❌ Error logging medicine removal:', error);
                return false;
            }

            console.log('✅ Medicine removal logged successfully');
            return true;
        } catch (error) {
            console.error('❌ Unexpected error logging medicine removal:', error);
            return false;
        }
    }

    // Log medicine reorder
    static async logMedicineReorder(
        userId: number,
        medicineReorderId: number,
        description: string
    ): Promise<boolean> {
        try {
            console.log('📝 Logging medicine reorder to history_log...');
            
            const { error } = await supabase
                .from('history_log')
                .insert({
                    user_id: userId,
                    medicine_reorder_id: medicineReorderId,
                    action_type: 'REORDER',
                    description: description,
                    logged_at: new Date().toISOString()
                });

            if (error) {
                console.error('❌ Error logging medicine reorder:', error);
                return false;
            }

            console.log('✅ Medicine reorder logged successfully');
            return true;
        } catch (error) {
            console.error('❌ Unexpected error logging medicine reorder:', error);
            return false;
        }
    }

    // Get all history logs for a branch
    static async getBranchHistoryLogs(branchId: number, limit: number = 100): Promise<HistoryLog[]> {
        try {
            console.log('📖 Fetching branch history logs...');
            
            const { data, error } = await supabase
                .from('history_log')
                .select(`
                    *,
                    user:users(user_id, name, email),
                    medicine:medicines(medicine_name, medicine_type),
                    medicine_stock_in:medicine_stock_in(
                        medicine_id,
                        quantity,
                        lot_number,
                        expiration_date,
                        medicine:medicines(medicine_name, medicine_type)
                    ),
                    medicine_stock_out:medicine_stock_out(
                        medicine_id,
                        quantity_dispensed,
                        timestamp_dispensed,
                        medicine_stock_in:medicine_stock_in(
                            medicine:medicines(medicine_name)
                        )
                    ),
                    medicine_deleted:medicine_deleted(
                        medicine_id,
                        quantity_deleted,
                        reason_for_deletion,
                        medicine_name
                    ),
                    medicine_reorder:medicine_reorder(
                        medicine_id,
                        quantity_requested,
                        status,
                        medicine:medicines(medicine_name)
                    )
                `)
                .order('logged_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('❌ Error fetching history logs:', error);
                return [];
            }

            console.log('✅ History logs fetched successfully:', data?.length || 0, 'records');
            return data || [];
        } catch (error) {
            console.error('❌ Unexpected error fetching history logs:', error);
            return [];
        }
    }

    // Get history logs for a specific user
    static async getUserHistoryLogs(userId: number, limit: number = 50): Promise<HistoryLog[]> {
        try {
            console.log('📖 Fetching user history logs...');
            
            const { data, error } = await supabase
                .from('history_log')
                .select(`
                    *,
                    user:users(user_id, name, email),
                    medicine_stock_in:medicine_stock_in(
                        medicine_id,
                        quantity,
                        lot_number,
                        expiration_date,
                        medicine:medicines(medicine_name, medicine_type)
                    ),
                    medicine_stock_out:medicine_stock_out(
                        medicine_id,
                        quantity_dispensed,
                        timestamp_dispensed,
                        medicine_stock_in:medicine_stock_in(
                            medicine:medicines(medicine_name)
                        )
                    ),
                    medicine_deleted:medicine_deleted(
                        medicine_id,
                        quantity_deleted,
                        reason_for_deletion,
                        medicine_name
                    ),
                    medicine_reorder:medicine_reorder(
                        medicine_id,
                        quantity_requested,
                        status,
                        medicine:medicines(medicine_name)
                    )
                `)
                .eq('user_id', userId)
                .order('logged_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('❌ Error fetching user history logs:', error);
                return [];
            }

            console.log('✅ User history logs fetched successfully:', data?.length || 0, 'records');
            return data || [];
        } catch (error) {
            console.error('❌ Unexpected error fetching user history logs:', error);
            return [];
        }
    }

    // Test if history_log table exists and is accessible
    static async testHistoryLogTable(): Promise<boolean> {
        try {
            console.log('🔍 Testing history_log table accessibility...');
            
            const { data, error } = await supabase
                .from('history_log')
                .select('history_id')
                .limit(1);

            if (error) {
                console.error('❌ history_log table test failed:', error);
                return false;
            }

            console.log('✅ history_log table is accessible');
            return true;
        } catch (error) {
            console.error('❌ Unexpected error testing history_log table:', error);
            return false;
        }
    }
}
