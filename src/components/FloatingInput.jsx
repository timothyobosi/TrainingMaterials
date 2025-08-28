
import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";


const iconMap = {
    email: <FaEnvelope/>
    password: <FaLock/>
};

export default function Floating({label, type = "text",value, onChange,name}){
    const [] = useState(false);

    return(
        <div>
            
        </div>

    );
}