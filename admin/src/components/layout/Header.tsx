import React, {useState} from "react";
import {Moon,Sun} from "lucide-react";

interface HeaderProps {
    title?: string
}

export default function Header({title = 'Admin dashbord'}: HeaderProps){
    const[isDark,setIsDark] = useState(false);

    return(
        <header className="w-full h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between select-none">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                {title}
            </h1>
            <div className="flex items-center gap-4">
                <button
                onClick={() => setIsDark(!isDark)}
          title="Toggle Theme"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
               <div className="w-9 h-9 rounded-full bg-emerald-900 text-white font-bold text-sm flex items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all">
          A
        </div> </div>
        </header>
    )
}