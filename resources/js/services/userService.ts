import { supabase } from '../lib/supabaseClient';

export interface User {
  user_id: number;
  email: string;
  name: string;
  branch_id: number;
  branch_name?: string;
}

export interface UserWithBranch extends User {
  branches?: {
    branch_id: number;
    branch_name: string;
  };
}

export class UserService {
  // Get user by email from Supabase
  static async getUserByEmail(email: string): Promise<UserWithBranch | null> {
    console.log('Searching for user with email:', email);
    
    // First, try to get the user without the join to see if the user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Simple user query result:', { data: userData, error: userError });

    if (userError) {
      // Try case-insensitive search
      console.log('Trying case-insensitive search...');
      const { data: caseInsensitiveData, error: caseError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email);
      
      console.log('Case-insensitive query result:', { data: caseInsensitiveData, error: caseError });
      
      if (caseError || !caseInsensitiveData || caseInsensitiveData.length === 0) {
        console.error('User not found:', userError || caseError);
        return null;
      }
      
      // Use the first match from case-insensitive search
      const foundUser = caseInsensitiveData[0];
      
      // Now try to get the branch info separately
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('branch_id, branch_name')
        .eq('branch_id', foundUser.branch_id)
        .single();
      
      console.log('Branch query result:', { data: branchData, error: branchError });
      
      return {
        ...foundUser,
        branches: branchData || {
          branch_id: foundUser.branch_id,
          branch_name: 'Unknown Branch'
        }
      };
    }

    // User found, now get branch info separately
    if (userData) {
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('branch_id, branch_name')
        .eq('branch_id', userData.branch_id)
        .single();
      
      console.log('Branch query result:', { data: branchData, error: branchError });
      
      return {
        ...userData,
        branches: branchData || {
          branch_id: userData.branch_id,
          branch_name: 'Unknown Branch'
        }
      };
    }

    return null;
  }

  // Check if user exists and is authorized
  static async verifyUserAccess(email: string): Promise<UserWithBranch> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      throw new Error('Access denied: Your email is not registered in the system. Please contact your administrator.');
    }

    return user;
  }

  // Get current user from localStorage
  static getCurrentUser(): User | null {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) return null;

    try {
      return {
        user_id: parseInt(localStorage.getItem('userId') || '0'),
        email: localStorage.getItem('userEmail') || '',
        name: localStorage.getItem('userName') || '',
        branch_id: parseInt(localStorage.getItem('userBranchId') || '1'),
        branch_name: localStorage.getItem('userBranchName') || ''
      };
    } catch {
      return null;
    }
  }

  // Store user session
  static storeUserSession(user: UserWithBranch): void {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', user.user_id.toString());
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userBranchId', user.branch_id.toString());
    
    // Handle case where branches might be null or undefined
    const branchName = user.branches?.branch_name || 'Unknown Branch';
    localStorage.setItem('userBranchName', branchName);
    localStorage.setItem('userBranchSuffix', ''); // No suffix in your schema
  }

  // Clear user session
  static clearUserSession(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userBranchId');
    localStorage.removeItem('userBranchName');
    localStorage.removeItem('userBranchSuffix'); // Keep for cleanup
  }

  // Get user's branch ID
  static getCurrentUserBranchId(): number {
    return parseInt(localStorage.getItem('userBranchId') || '1');
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}
