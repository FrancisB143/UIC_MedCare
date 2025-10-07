// UserService for MSSQL/SSMS database integration via Laravel backend
export interface User {
    user_id: number;
    email: string;
    name: string;
    branch_id: number;
    branch_name?: string;
    role?: string; // Added: role field for student/employee distinction
    is_student?: boolean; // Added: boolean flag for student status
}

export interface UserWithBranch extends User {
    branches?: {
        branch_id: number;
        branch_name: string;
    };
}

export class UserService {
    // Get user by email from MSSQL database via Laravel API
    static async getUserByEmail(email: string): Promise<UserWithBranch | null> {
        console.log('Searching for user with email:', email);

        try {
            const response = await fetch('/api/users/by-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                console.error('API request failed:', response.status, response.statusText);
                return null;
            }

            const data = await response.json();
            console.log('User data from MSSQL:', data);

            if (data.success && data.user) {
                return data.user;
            }

            return null;
        } catch (error) {
            console.error('Error fetching user from MSSQL:', error);
            return null;
        }
    }

    // Verify user access - check if user exists and is authorized
    static async verifyUserAccess(email: string): Promise<User> {
        console.log('Verifying user access for:', email);

        // First check if the email is from UIC domain
        if (email.endsWith('@uic.edu.ph')) {
            console.log('UIC email domain detected, granting access');

            const user = await this.getUserByEmail(email);

            if (user) {
                console.log('User found in database:', user);
                return user;
            } else {
                // For UIC emails not in database, create a temporary user object
                // The backend will need to handle this user eventually
                console.log('UIC user not in database, creating temporary access');

                // Check if this is a student email (contains 12 numbers before @uic.edu.ph)
                const emailPrefix = email.split('@')[0];
                const isStudent = /.*_\d{12}$/.test(emailPrefix);
                const displayName = emailPrefix.split('_')[0]; // Get name part before underscore

                console.log('Email identified as:', isStudent ? 'Student' : 'Employee');

                return {
                    user_id: -1, // Temporary ID
                    email: email,
                    name: displayName, // Use part before underscore as name
                    branch_id: 1, // Default branch ID
                    role: isStudent ? 'student' : 'employee',
                    is_student: isStudent,
                };
            }
        }

        // For non-UIC emails, use the existing verification logic
        const user = await this.getUserByEmail(email);

        if (!user) {
            throw new Error('Access denied. You are not authorized to use this system.');
        }

        console.log('User access verified:', user);
        return user;
    }

    // Get user branch information from MSSQL
    static async getUserBranchInfo(userId: number): Promise<any> {
        console.log('Getting branch info for user:', userId);

        try {
            const response = await fetch(`/api/users/${userId}/branch`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                console.error('Branch info API request failed:', response.status);
                return null;
            }

            const data = await response.json();
            console.log('Branch info from MSSQL:', data);

            return data.success ? data.branch : null;
        } catch (error) {
            console.error('Error fetching branch info from MSSQL:', error);
            return null;
        }
    }

    // Store user session in localStorage
    static storeUserSession(userData: User): void {
        console.log('Storing user session:', userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
    }

    // Get current user from localStorage
    static getCurrentUser(): User | null {
        try {
            const userString = localStorage.getItem('currentUser');
            if (!userString) return null;

            return JSON.parse(userString);
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            return null;
        }
    }

    // Clear user session
    static clearUserSession(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
    }

    // Check if user is logged in
    static isLoggedIn(): boolean {
        return localStorage.getItem('isLoggedIn') === 'true' && this.getCurrentUser() !== null;
    }

    // Get all users from MSSQL (for admin purposes)
    static async getAllUsers(): Promise<User[]> {
        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                console.error('Get all users API request failed:', response.status);
                return [];
            }

            const data = await response.json();
            return data.success ? data.users : [];
        } catch (error) {
            console.error('Error fetching all users from MSSQL:', error);
            return [];
        }
    }

    // Create new user in MSSQL
    static async createUser(userData: Omit<User, 'user_id'>): Promise<User | null> {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                console.error('Create user API request failed:', response.status);
                return null;
            }

            const data = await response.json();
            return data.success ? data.user : null;
        } catch (error) {
            console.error('Error creating user in MSSQL:', error);
            return null;
        }
    }

    // Update user in MSSQL
    static async updateUser(userId: number, userData: Partial<User>): Promise<User | null> {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                console.error('Update user API request failed:', response.status);
                return null;
            }

            const data = await response.json();
            return data.success ? data.user : null;
        } catch (error) {
            console.error('Error updating user in MSSQL:', error);
            return null;
        }
    }

    // Delete user from MSSQL
    static async deleteUser(userId: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                console.error('Delete user API request failed:', response.status);
                return false;
            }

            const data = await response.json();
            return data.success || false;
        } catch (error) {
            console.error('Error deleting user from MSSQL:', error);
            return false;
        }
    }
}
