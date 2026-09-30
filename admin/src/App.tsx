import Sidebar from "./components/layout/slidebar";

export default function App() {
  return (
    <div className="flex min-h-screnn bg-slate-100">
      <Sidebar/>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Sidebar connected successfully! Next, we will add the Header and Dashboard Cards here.
        </p>
      </main>
    </div>
  );
}
