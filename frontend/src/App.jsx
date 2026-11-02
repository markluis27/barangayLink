import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Documents from './pages/Documents';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function MainRouter() {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setView] = useState('home');
  const [selectedDocId, setSelectedDocId] = useState(null);

  const handleSelectDocument = (docId) => {
    setSelectedDocId(docId);
  };

  // Render view based on state and role guards
  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-tinurik-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-semibold">Connecting to Barangay Tinurik Portal...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return <Home setView={setView} />;
      case 'about':
        return <About setView={setView} />;
      case 'documents':
        return <Documents setView={setView} onSelectDocument={handleSelectDocument} />;
      case 'login':
        return <Login setView={setView} />;
      case 'register':
        return <Register setView={setView} />;
      case 'resident-dashboard':
        if (!user) {
          return <Login setView={setView} />;
        }
        return <ResidentDashboard setView={setView} defaultDocumentTypeId={selectedDocId} />;
      case 'admin-dashboard':
        if (!user || !isAdmin) {
          return <Login setView={setView} />;
        }
        return <AdminDashboard setView={setView} />;
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar currentView={currentView} setView={setView} />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer setView={setView} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
