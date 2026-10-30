import React, { useState, useEffect } from 'react';
import StaffLoginPage from './components/StaffLoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import Navbar from './components/Navbar';
import StaffDashboard from './components/StaffDashboard';
import AdminPanel from './components/AdminPanel';
import { 
  initializeStorage, 
  getActiveSession, 
  authenticateUser, 
  logoutUser 
} from './utils/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync with browser URL changes (pathname and hash)
  useEffect(() => {
    initializeStorage();
    const session = getActiveSession();
    if (session) {
      setCurrentUser(session);
    }
    setIsInitialized(true);

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      window.location.hash = path;
    }
    setCurrentPath(path);
  };

  // Determine if URL is targeting Admin route
  const isAdminRoute = 
    currentPath.toLowerCase().startsWith('/admin') || 
    window.location.hash.toLowerCase().includes('admin');

  // Unified login handler with expected role enforcement
  const handleLoginSuccess = (email, password, expectedRole) => {
    const res = authenticateUser(email, password, expectedRole);
    if (res.success) {
      setCurrentUser(res.user);
      if (res.user.role === 'admin') {
        navigateTo('/admin');
      } else {
        navigateTo('/');
      }
    }
    return res;
  };

  const handleLogout = () => {
    const wasAdmin = currentUser?.role === 'admin';
    logoutUser();
    setCurrentUser(null);
    if (wasAdmin || isAdminRoute) {
      navigateTo('/admin');
    } else {
      navigateTo('/');
    }
  };

  // Switch to specific staff member (from Admin panel)
  const handleSwitchToStaff = (staff) => {
    localStorage.setItem('maas_active_session', JSON.stringify(staff));
    setCurrentUser(staff);
    navigateTo('/');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-brand-navy border-t-transparent animate-spin" />
      </div>
    );
  }

  // ROUTE 1: ADMIN PORTAL (/admin)
  if (isAdminRoute) {
    // If logged in as admin -> render Admin Panel
    if (currentUser && currentUser.role === 'admin') {
      return (
        <AdminPanel 
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchToStaff={handleSwitchToStaff}
        />
      );
    }

    // Not logged in as admin -> Show dedicated Admin Login Form
    return (
      <AdminLoginPage 
        onLoginSuccess={handleLoginSuccess}
        onNavigateToStaff={() => navigateTo('/')}
      />
    );
  }

  // ROUTE 2: STAFF ATTENDANCE PORTAL (/)
  // If logged in as staff -> render Staff Dashboard
  if (currentUser && currentUser.role === 'staff') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="pb-12">
          <StaffDashboard 
            currentUser={currentUser}
          />
        </main>
      </div>
    );
  }

  // If logged in as admin but visited '/'
  if (currentUser && currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar 
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchToAdmin={() => navigateTo('/admin')}
        />
        <main className="pb-12">
          <StaffDashboard 
            currentUser={currentUser}
          />
        </main>
      </div>
    );
  }

  // Default: Not logged in on '/' -> Show Staff Login Page
  return (
    <StaffLoginPage 
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
