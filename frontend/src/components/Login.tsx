/**
 * Login Component
 * Provides login and registration forms
 */

import { useState } from'react';
import { useAuthContext } from'../contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, AlertCircle } from'lucide-react';

interface LoginProps {
 onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
 const [isRegistering, setIsRegistering] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [formData, setFormData] = useState({
 email:'',
 password:'',
 firstName:'',
 lastName:''
 });

 const { login, register, loading, error, clearError } = useAuthContext();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 clearError();

 try {
 if (isRegistering) {
 await register({
 email: formData.email,
 password: formData.password,
 firstName: formData.firstName,
 lastName: formData.lastName
 });
 } else {
 await login({
 email: formData.email,
 password: formData.password
 });
 }

 // Clear form
 setFormData({
 email:'',
 password:'',
 firstName:'',
 lastName:''
 });

 // Call success callback if provided
 if (onSuccess) {
 onSuccess();
 }
 } catch (err) {
 // Error is handled by the auth context
 console.error('Auth error:', err);
 }
 };

 const toggleMode = () => {
 setIsRegistering(!isRegistering);
 clearError();
 setFormData({
 email:'',
 password:'',
 firstName:'',
 lastName:''
 });
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full space-y-8">
 <div>
 <h2 className="mt-6 text-center text-gray-900">
 {isRegistering ?'Créer un compte' : 'Se connecter à PAA'}
 </h2>
 <p className="mt-2 text-center text-gray-600">
 {isRegistering
 ?'Inscrivez-vous pour accéder aux services'
 :'Accédez à votre espace personnel'}
 </p>
 </div>

 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
 {error && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
 <div className="flex-1">
 <p className="text-red-700 font-medium">Erreur</p>
 <p className="text-red-600">{error.message}</p>
 </div>
 </div>
 )}

 <div className="rounded-md shadow-sm -space-y-px">
 {isRegistering && (
 <>
 <div>
 <label htmlFor="firstName" className="sr-only">
 Prénom
 </label>
 <input
 id="firstName"
 name="firstName"
 type="text"
 autoComplete="given-name"
 required={isRegistering}
 value={formData.firstName}
 onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10"
 placeholder="Prénom"
 />
 </div>
 <div>
 <label htmlFor="lastName" className="sr-only">
 Nom
 </label>
 <input
 id="lastName"
 name="lastName"
 type="text"
 autoComplete="family-name"
 required={isRegistering}
 value={formData.lastName}
 onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10"
 placeholder="Nom"
 />
 </div>
 </>
 )}

 <div>
 <label htmlFor="email" className="sr-only">
 Email
 </label>
 <input
 id="email"
 name="email"
 type="email"
 autoComplete="email"
 required
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white ${
 !isRegistering ?'rounded-t-md' : ''
 } focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10`}
 placeholder="Adresse email"
 />
 </div>

 <div className="relative">
 <label htmlFor="password" className="sr-only">
 Mot de passe
 </label>
 <input
 id="password"
 name="password"
 type={showPassword ?'text' : 'password'}
 autoComplete={isRegistering ?'new-password' : 'current-password'}
 required
 minLength={8}
 value={formData.password}
 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
 className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10"
 placeholder="Mot de passe (min 8 caractères)"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center"
 >
 {showPassword ? (
 <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
 ) : (
 <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
 )}
 </button>
 </div>
 </div>

 <div>
 <button
 type="submit"
 disabled={loading}
 className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {loading ? (
 <>
 <Loader2 className="w-5 h-5 mr-2 animate-spin" />
 {isRegistering ?'Inscription...' : 'Connexion...'}
 </>
 ) : (
 <>
 {isRegistering ? (
 <>
 <UserPlus className="w-5 h-5 mr-2" />
 S'inscrire
 </>
 ) : (
 <>
 <LogIn className="w-5 h-5 mr-2" />
 Se connecter
 </>
 )}
 </>
 )}
 </button>
 </div>

 <div className="text-center">
 <button
 type="button"
 onClick={toggleMode}
 className="font-medium text-purple-600 hover:text-purple-500"
 >
 {isRegistering
 ?'Déjà un compte? Se connecter'
 :'Pas encore de compte? S\'inscrire'}
 </button>
 </div>
 </form>

 <div className="mt-6">
 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-gray-300" />
 </div>
 <div className="relative flex justify-center">
 <span className="px-2 bg-gray-50 text-gray-500">
 Ou continuer sans compte
 </span>
 </div>
 </div>

 <div className="mt-6">
 <button
 type="button"
 onClick={() => onSuccess && onSuccess()}
 className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
 >
 Continuer en mode invité
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}