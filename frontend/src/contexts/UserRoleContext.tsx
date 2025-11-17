import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole } from '../types/routes';

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    // Check localStorage for saved role preference
    const saved = localStorage.getItem('paa-user-role');
    if (saved && ['citizen', 'social-worker', 'developer'].includes(saved)) {
      return saved as UserRole;
    }
    // Default to citizen
    return 'citizen';
  });

  useEffect(() => {
    // Save role preference to localStorage
    localStorage.setItem('paa-user-role', role);
  }, [role]);

  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}