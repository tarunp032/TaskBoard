
import './App.css'
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Signup from './pages/Singup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TasksToMe from './pages/TasksToMe';
import TasksByMe from './pages/TasksByMe';
import Header from './components/Header';

// Protected Route
const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  
  return user ? (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks-to-me" element={<TasksToMe />} />
          <Route path="/tasks-by-me" element={<TasksByMe />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </>
  ) : (
    <Navigate to="/login" />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<PrivateRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
