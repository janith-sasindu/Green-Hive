import Sidebar from "./components/layout/slidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Admin Dashboard" />
        <main className="p-8 overflow-y-auto">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
