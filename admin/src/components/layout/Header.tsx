import React, {useState} from "react";
import {Moon,Sun} from "lucide-react";

interface HeaderProps {
    title?: string
}

export default function Header({title = 'Admin dashbord'}: HeaderProps){
    const[isDark,setIsDark] = useState(false);

    return(
        <header className="">
            <h1>
                {title}
            </h1>
        </header>
    )
}