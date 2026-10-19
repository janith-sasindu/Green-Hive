import { useState } from "react";
import Sidebar from "./components/layout/slidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      {/* 2. Sidebar with navigation callback */}
      <Sidebar
        activeItem={currentPage}
        onSelectItem={(pageId) => setCurrentPage(pageId)}
      />
      {/* 3. Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Dynamic header title */}
        <Header
          title={currentPage === "All Users" ? "User Management" : "Admin Dashboard"}
        />
        {/* 4. Switch between Dashboard and All Users page */}
        <main className="flex-1 p-8 overflow-y-auto">
          {currentPage === "All Users" ? <UsersPage /> : <DashboardPage />}
        </main>
      </div>
    </div>
  );
}
