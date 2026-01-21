
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home, News, Gallery, Database, ProfileView } from './pages/PublicPages';
import { Login, Register } from './pages/AuthPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { MemberArea } from './pages/MemberArea';
import { UserRole } from './types';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode, roles: UserRole[] }> = ({ children, roles }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/database" element={<Database />} />
        
        {/* Profile Routes */}
        <Route path="/profile/:slug" element={<ProfileView />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Member Routes */}
        <Route 
          path="/member" 
          element={
            <ProtectedRoute roles={[UserRole.MEMBER, UserRole.ADMIN]}>
              <MemberArea />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;