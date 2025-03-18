import React from 'react';
import {
  Box,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Sidebar_admin from "./components/Sidebar_admin"; // Import admin sidebar
import Navbar_admin from "./components/Navbar_admin"; // Import admin navbar
import Sidebar_man from "./components/Sidebar_man";
import Header from "./components/Header";
import { NotificationProvider } from './components/NotificationContext';
import HomePage from "./pages/HomePage";
import EmpPage from "./pages/EmpPage";
import CreateExp from "./pages/CreateExp";
import ReceiptUpload from "./pages/ReceiptUpload";
import DraftExpenses from "./pages/DraftExpenses";
import AIReports from "./pages/AIReports";
import AdminPage from "./pages/AdminPage";
import AdminReport from "./pages/AdminReport";
import BudgetManagement from "./pages/BudgetManagement";
import UserManagement from "./pages/UserManagement";
import Credentials from "./pages/Credentials";
import SignIn from "./pages/SignIn";
import Signup from "./pages/Signup";
import Chatbot from "./components/Chatbot";
import Dashboard from "./pages/Dashboard";
import Approvals from "./pages/Approvals";
import Review from "./pages/Review";
import ResetPassword from './components/ResetPassword';
import AuthenticationCheck from './components/AuthenticationCheck';
import ManReports from './pages/ManReports';
import Audit from './pages/Audit';
//import { LayoutProvider } from './components/LayoutContext';

function App() {
  const location = useLocation();
  const navigate = useNavigate(); // Use useNavigate for navigation
  
  // Page type detection
  const isHomePage = location.pathname === '/';
  const isResetPage = location.pathname === '/reset-password';
  const isSignIn = location.pathname === '/signin';
  const isSignup = location.pathname === '/signup';
  
  // Admin pages
  const isAdminPage = location.pathname === '/admin';
  const isUserManagement = location.pathname === '/user';
  const isBudgetManagement = location.pathname === '/budget';
  const isAdminReport = location.pathname === '/admin-report';
  const isCredentials = location.pathname === '/credentials';
  const isAudit = location.pathname === '/audit';
  
  // Manager pages
  const isManagerDashboard = location.pathname === '/manager';
  const isApprovals = location.pathname === '/approvals';
  const isReview = location.pathname.startsWith("/review")
  const isManreport = location.pathname === '/man-report';
  
  // Employee pages
  const isEmployeePage = location.pathname === '/employee';
  const isCreateExp = location.pathname === '/manual_expense';
  const isReceiptUpload = location.pathname === '/receipt_upload';
  const isDraftExpenses = location.pathname === '/draft';
  const isAIReports = location.pathname === '/report';
  
  // Layout logic
  const hideAllNavAndSidebar = isHomePage || isSignIn || isSignup || isResetPage;
  const showAdminLayout = isAdminPage || isUserManagement || isBudgetManagement || isAdminReport || isCredentials || isAudit;
  const showManagerLayout = isManagerDashboard || isApprovals || isReview || isManreport;
  const showEmployeeLayout = isEmployeePage || isCreateExp || isReceiptUpload || isDraftExpenses || isAIReports;

  // Function to check if the user is authenticated (e.g., token exists)
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Custom component to protect the route
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      // Redirect to signin page if not authenticated
      navigate('/signin');
      return null; // or <Navigate to="/signin" replace />;
    }
    return children;
  };

  return (
    <NotificationProvider>
      <Box minH="100vh" display="flex" bg={useColorModeValue('gray.50', 'gray.900')}>
        {/* Conditionally render the appropriate sidebar based on the page type */}
        {showAdminLayout && <Sidebar_admin activePage={location.pathname.split("/")[1]} />}
        {showManagerLayout && <Sidebar_man activePage={location.pathname.split("/")[1]} />}
        {showEmployeeLayout && <Sidebar />}

        <Box 
          flex="1" 
          ml={(showAdminLayout || showManagerLayout || showEmployeeLayout) ? { base: 0, lg: "64" } : 0}
        >
          {/* Conditionally render the appropriate navbar based on the page type */}
          {showAdminLayout && <Navbar_admin />}
          {showManagerLayout && <Header />}
          {showEmployeeLayout && <Navbar />}
          
          <AuthenticationCheck />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Employee routes */}
            <Route path="/employee" element={<EmpPage />} />
            <Route path="/manual_expense" element={<CreateExp />} />
            <Route path="/receipt_upload" element={<ReceiptUpload />} />
            <Route path="/draft" element={<DraftExpenses />} />
            <Route path="/report" element={<AIReports />} />
            
            {/* Authentication routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/user" element={<UserManagement />} />
            <Route path="/budget" element={<BudgetManagement />} />
            <Route path="/admin-report" element={<AdminReport />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/audit" element={<Audit />} />
            
            {/* Manager routes */}
            <Route path="/manager" element={<Dashboard />} />
            <Route path="/man-report" element={<ManReports />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/review/:expenseId" element={<Review />} />
          </Routes>
          
          {isAuthenticated() && <Chatbot />}
        </Box>
      </Box>
    </NotificationProvider>
  );
}

export default App;