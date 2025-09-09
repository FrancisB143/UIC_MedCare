# Google Authentication with Supabase Integration Guide

## 🎯 What This Does

When a user logs in with Google:
1. **Decodes Google JWT** to get user email and name
2. **Checks Supabase users table** to see if the email exists
3. **Gets user's branch information** from the database
4. **Stores user session** with branch details
5. **Redirects to dashboard** with user's branch access

If the user's Gmail is **NOT** in your database, they will see: 
> "Access denied: Your email is not registered in the system. Please contact your administrator."

## 🛠️ Setup Steps

### 1. Add Users to Your Supabase Database

Go to your Supabase dashboard > SQL Editor and run:

```sql
-- Add your actual Gmail addresses
INSERT INTO public.users (email, name, role, branch_id) VALUES
('your.email@gmail.com', 'Your Name', 'admin', 1),
('nurse@gmail.com', 'Nurse Name', 'nurse', 1),
('doctor@gmail.com', 'Doctor Name', 'doctor', 2);
```

### 2. Test the Login Flow

1. **Visit your login page**: `http://localhost:8000`
2. **Click "Sign in with Google"`**
3. **Use an email that exists in your users table**
4. **Should redirect to dashboard with user info displayed**

### 3. Check User Information

After login, you'll see:
- **User's name and email**
- **User's role** (admin, nurse, doctor)
- **User's branch** (automatically determined from database)
- **Branch-specific access** (only see medicines from their branch)

## 🔧 Available Functions

### UserService Methods

```tsx
// Get current logged-in user
const user = UserService.getCurrentUser();

// Get user's branch ID
const branchId = UserService.getCurrentUserBranchId();

// Check if user is admin
const isAdmin = UserService.isAdmin();

// Check if user is logged in
const loggedIn = UserService.isLoggedIn();

// Clear session on logout
UserService.clearUserSession();
```

### Using in Components

```tsx
import { UserService } from '../services/userService';

function MyComponent() {
  const user = UserService.getCurrentUser();
  const userBranchId = UserService.getCurrentUserBranchId();
  
  // Now you can use userBranchId to filter medicines
  useEffect(() => {
    MedicineService.getMedicinesByBranch(userBranchId)
      .then(setMedicines);
  }, [userBranchId]);

  if (!user) return <div>Please log in</div>;
  
  return (
    <div>
      Welcome {user.name} from {user.branch_name}!
      {UserService.isAdmin() && <AdminPanel />}
    </div>
  );
}
```

## 🎨 UI Updates

Your application now shows:
- **User info in Dashboard** with name, email, role, and branch
- **Dynamic sidebar** showing user's actual name and branch
- **Branch-specific access** throughout the app

## 🔐 Security Features

1. **Email Verification**: Only emails in your database can log in
2. **Role-based Access**: Different permissions for admin/nurse/doctor
3. **Branch Isolation**: Users only see data from their assigned branch
4. **Session Management**: Proper login/logout handling

## 📝 Database Schema

Your `users` table should have:
- `email` (VARCHAR) - Gmail address
- `name` (VARCHAR) - User's display name
- `role` (VARCHAR) - 'admin', 'nurse', or 'doctor'
- `branch_id` (BIGINT) - References branches table

## 🚀 Next Steps

1. **Add your Gmail addresses** to the users table
2. **Test the login flow** with different user types
3. **Update other components** to use `UserService.getCurrentUserBranchId()`
4. **Implement role-based permissions** where needed

## 🐛 Troubleshooting

**"Access denied" message**: 
- Make sure your Gmail is in the users table
- Check the email spelling exactly matches

**User info not showing**:
- Check browser console for errors
- Verify Supabase connection is working

**Wrong branch access**:
- Check user's branch_id in database
- Verify branches table has correct data
