import React, { useState } from "react";
import Sidebar from "./components/layout/slidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ManageAdminsPage from "./pages/ManageAdminsPage";
import AdsManagementPage from "./pages/AdsManagementPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");

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
      default:
        return "Admin Dashboard";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeItem={currentPage}
        onSelectItem={(pageId) => setCurrentPage(pageId)}
      />

      {/* 2. Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={getPageTitle()} />

        {/* 3. Render the active page */}
        <main className="flex-1 p-8 overflow-y-auto">
          {currentPage === "All Users" && <UsersPage />}
          {currentPage === "Approvals" && <ApprovalsPage />}
          {currentPage === "Manage Admins" && <ManageAdminsPage />}
          {currentPage === "Ads Management" && <AdsManagementPage />}
          {currentPage === "Dashboard" && <DashboardPage />}
        </main>
      </div>
    </div>
  );
}
