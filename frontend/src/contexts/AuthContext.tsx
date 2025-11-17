/**
 * Authentication Context Provider
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, ReactNode } from'react';
import { useAuth } from'../hooks/useAuth';
import type { User } from'../hooks/useAuth';
import type { LoginRequest, RegisterRequest, APIError } from'../services/api';

interface AuthContextValue {
 user: User | null;
 isAuthenticated: boolean;
 loading: boolean;
 error: APIError | null;
 login: (credentials: LoginRequest) => Promise<void>;
 register: (data: RegisterRequest) => Promise<void>;
 logout: () => void;
 clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Context Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
 const auth = useAuth();

 return (
 <AuthContext.Provider value={auth}>
 {children}
 </AuthContext.Provider>
 );
}

/**
 * Hook to use auth context
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextValue {
 const context = useContext(AuthContext);

 if (!context) {
 throw new Error('useAuthContext must be used within an AuthProvider');
 }

 return context;
}

/**
 * Higher-Order Component to protect routes that require authentication
 */
export function withAuth<P extends object>(
 Component: React.ComponentType<P>,
 fallback?: React.ComponentType
) {
 return function AuthProtectedComponent(props: P) {
 const { isAuthenticated, loading } = useAuthContext();

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Vérification de l'authentification...</p>
 </div>
 </div>
 );
 }

 if (!isAuthenticated) {
 if (fallback) {
 const FallbackComponent = fallback;
 return <FallbackComponent />;
 }

 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="text-center">
 <h2 className="text-gray-900 mb-4">Authentification requise</h2>
 <p className="text-gray-600 mb-6">
 Veuillez vous connecter pour accéder à cette page.
 </p>
 <button
 onClick={() => window.location.href ='/login'}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 Se connecter
 </button>
 </div>
 </div>
 );
 }

 return <Component {...props} />;
 };
}