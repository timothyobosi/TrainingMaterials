
const BASE_URL = '/api/Agents';

export async function login(email,password){
    const res = await fetch(`${BASE_URL}/login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email,password})
    })
    return res.json();
}

export async function setPassword(email,password){
    const res = await fetch(`${BASE_URL}/set-password`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email,password}),
    });
    return res.json();
}

export async function resetPassword(email){
    const res = await fetch(`${BASE_URL}/reset-password`,{
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email}),
    });
    return res.json();
}

export async function completeResetPassword(token,password){
    const res = await fetch(`${BASE_URL}/complete-reset-password`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({token,password}),
    });
    return res.json();
}

export async function changePassword(oldPassword, newPassword, token){
    const res = await fetch(`${BASE_URL}/change-password`,{
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({oldPassword, newPassword}),
    });
    res.json();
}