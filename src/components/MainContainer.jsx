import React from 'react'

const MainContainer = ({children}) => {
  return (
    <div
    style={{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        minHeight:'100vh',
        padding:'1rem',
        textAlign:'center',
    }}
    >
        {children}
    </div>
  )
}

export default MainContainer