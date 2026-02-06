import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin credentials
  const ADMIN_CREDENTIALS = {
    email: 'admin@gmail.com',
    password: 'admin@2026',
    role: 'admin'
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const userData = {
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        name: 'Admin'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, role: 'admin' };
    }
    
    // For any other credentials, treat as regular user
    if (email && password) {
      const userData = {
        email: email,
        role: 'user',
        name: email.split('@')[0]
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, role: 'user' };
    }

    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    login,
    logout,
    isAdmin,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
