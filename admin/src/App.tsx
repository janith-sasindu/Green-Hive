import Header from "./components/layout/Header";
import Sidebar from "./components/layout/slidebar";

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar/>
      <Header/>
    </div>
  );
}
