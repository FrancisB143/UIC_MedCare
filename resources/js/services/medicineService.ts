import { supabase } from '../lib/supabaseClient'

export interface Medicine {
  id: number
  name: string
  category: string
  stock: number
  expiry: string
  branch_id: number
  created_at?: string
  updated_at?: string
}

export interface MedicineRequest {
  id?: number
  medicine_id: number
  requested_by: string
  quantity: number
  status: 'pending' | 'approved' | 'rejected'
  branch_id: number
  created_at?: string
}

export class MedicineService {
  // Get all medicines for a specific branch
  static async getMedicinesByBranch(branchId: number): Promise<Medicine[]> {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('branch_id', branchId)
      .order('name')

    if (error) {
      console.error('Error fetching medicines:', error)
      throw error
    }

    return data || []
  }

  // Add a new medicine
  static async addMedicine(medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>): Promise<Medicine> {
    const { data, error } = await supabase
      .from('medicines')
      .insert([medicine])
      .select()
      .single()

    if (error) {
      console.error('Error adding medicine:', error)
      throw error
    }

    return data
  }

  // Update medicine stock
  static async updateMedicineStock(id: number, newStock: number): Promise<Medicine> {
    const { data, error } = await supabase
      .from('medicines')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating medicine stock:', error)
      throw error
    }

    return data
  }

  // Delete a medicine
  static async deleteMedicine(id: number): Promise<void> {
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting medicine:', error)
      throw error
    }
  }

  // Request medicine from another branch
  static async requestMedicine(request: Omit<MedicineRequest, 'id' | 'created_at'>): Promise<MedicineRequest> {
    const { data, error } = await supabase
      .from('medicine_requests')
      .insert([request])
      .select()
      .single()

    if (error) {
      console.error('Error creating medicine request:', error)
      throw error
    }

    return data
  }

  // Get medicine requests for a branch
  static async getMedicineRequests(branchId: number): Promise<MedicineRequest[]> {
    const { data, error } = await supabase
      .from('medicine_requests')
      .select(`
        *,
        medicines (
          name,
          category
        )
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching medicine requests:', error)
      throw error
    }

    return data || []
  }

  // Search medicines by name or category
  static async searchMedicines(branchId: number, searchTerm: string): Promise<Medicine[]> {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('branch_id', branchId)
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('name')

    if (error) {
      console.error('Error searching medicines:', error)
      throw error
    }

    return data || []
  }
}
