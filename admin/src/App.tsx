import React, { useState } from "react";
import Sidebar from "./components/layout/slidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ManageAdminsPage from "./pages/ManageAdminsPage";
import AdsManagementPage from "./pages/AdsManagementPage";
import OperationsPage from "./pages/OperationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportPage";


export default function App() {
  // Check if admin token exists in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("green_hive_admin_token"));
  });

  const [currentPage, setCurrentPage] = useState("Dashboard");

  // Handle Logout: removes tokens and returns to LoginPage
  const handleLogout = () => {
    localStorage.removeItem("green_hive_admin_token");
    localStorage.removeItem("green_hive_admin_user");
    setIsAuthenticated(false);
  };

  // If not authenticated, render LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Dynamic Header Title
  const getPageTitle = () => {
    switch (currentPage) {
      case "All Users":
        return "User Management";
      case "Approvals":
        return "Account Approvals";
      case "Manage Admins":
        return "Manage Admins";
      case "Ads Management":
        return "Ads Management";
      case "Operations":
        return "Operations";
      case "Payments":
        return "Payments & Escrow";
      default:
        return "Admin Dashboard";
    }
  };

  return (
<div className="flex h-screen overflow-hidden bg-[#eef2f6] dark:bg-slate-950 transition-colors">      <Sidebar
        activeItem={currentPage}
        onSelectItem={(pageId) => {
          if (pageId === "logout") {
            handleLogout();
          } else {
            setCurrentPage(pageId);
          }
        }}
        onLogout={handleLogout}
      />

      {/* 2. Right Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Pinned Top Header with working Logout button */}
        <Header 
          title={getPageTitle()} 
          onLogout={handleLogout} 
        />

        {/* 3. Scrollable Main Page Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {currentPage === "All Users" && <UsersPage />}
          {currentPage === "Approvals" && <ApprovalsPage />}
          {currentPage === "Manage Admins" && <ManageAdminsPage />}
          {currentPage === "Ads Management" && <AdsManagementPage />}
          {currentPage === "Operations" && <OperationsPage />}
          {currentPage === "Payments" && <PaymentsPage />}
          {currentPage === "Dashboard" && <DashboardPage />}
          {currentPage === "Reports" && <ReportsPage />}
        </main>
      </div>
    </div>
  );
}