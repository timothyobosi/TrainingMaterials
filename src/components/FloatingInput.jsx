
import { useState } from "react";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";


const iconMap = {
    email: <FaEnvelope/>,
    password: <FaLock/>,
    token: <FaKey/>
};

export default function Floating({label, type = "text",value, onChange,name}){
    const [focused, setFocused] = useState(false);

    return(
        <div className="input-wrapper">
            <div className="icon">{iconMap[name]} </div>
            <input 
            type={type} 
            value={value}
            name={name}
            onChange={onChange}
            onFocus={()=>setFocused(true)}
            onBlur={() => setFocused(false)}
            required
            />
            <label className={focused || value ? "float":""}>{label} </label>

        </div>

    );
}