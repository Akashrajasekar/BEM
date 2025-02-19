import React from 'react';
import {
  Box,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
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
import Sidebar_man from "./components/Sidebar_man";
import Header from "./components/Header";

function App() {
  const location = useLocation();
  const navigate = useNavigate(); // Use useNavigate for navigation
  const isHomePage = location.pathname === '/';
  const isResetPage = location.pathname === '/reset-password';
  const isAdminPage = location.pathname === '/admin';
  const isBudgetManagement = location.pathname === '/budget';
  const isAdminReport = location.pathname === '/admin-report';
  const isSignIn = location.pathname === '/signin';
  const isUserManagement = location.pathname === '/user';
  const isCredentials = location.pathname === '/credentials';
  const isSignup = location.pathname === '/signup';
  const isManagerDashboard = location.pathname === '/manager'; // Added route
  const isApprovals = location.pathname === '/approvals'; // Added route
  const isReview = location.pathname === '/review'; // Added route
  const hideNavAndSidebar = isHomePage || isAdminPage || isBudgetManagement || isAdminReport || isSignIn || isUserManagement || isCredentials || isSignup || isResetPage; //Removed routes from hide

  const showManagerLayout = isManagerDashboard || isApprovals || isReview;

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
    <Box minH="100vh" display="flex" bg={useColorModeValue('gray.50', 'gray.900')}>
      {showManagerLayout ? <Sidebar_man /> : !hideNavAndSidebar && <Sidebar />}
      <Box flex="1" ml={showManagerLayout ? { base: 0, lg: "64" } : !hideNavAndSidebar ? { base: 0, lg: "64" } : 0}>
        {showManagerLayout ? <Header /> : !hideNavAndSidebar && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/employee" element={<EmpPage />} />
          <Route path="/manual_expense" element={<CreateExp />} />
          <Route path="/receipt_upload" element={<ReceiptUpload />} />
          <Route path="/draft" element={<DraftExpenses />} />
          <Route path="/report" element={<AIReports />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<UserManagement />} />
          <Route path="/credentials" element={<Credentials />} />
           {/* Protect the /admin route */}
           <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          <Route path="/budget" element={<BudgetManagement />} />
          <Route path="/admin-report" element={<AdminReport />} />
          <Route path="/manager" element={<Dashboard />} /> {/*Manager Dashboard*/}
          <Route path="/approvals" element={<Approvals />} /> {/*Approvals Page*/}
          <Route path="/review" element={<Review />} /> {/*Review Page*/}
        </Routes>
        <Chatbot />
      </Box>
    </Box>
  );
}

export default App;
