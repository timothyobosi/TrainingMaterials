import React from 'react'

const Button = ({children, onClick, disabled}) => {
  return (
    <button
    onClick = {onClick}
        disabled = {disabled}
        style ={{
            padding: '0.6rem 1.4rem',
            margin: '0.5rem',
            fontsize: '1rem',
            cursor: disabled ? 'not-allowed':'pointer',
            background: disabled ? '#cccccc' : 'linear-gradient(90deg, #1914a1ff,#66BB6A)',
            color: 'white',
            border:'none',
            borderRadius:'8px,',
            transition:'transform 0.2s, background 0.3s',
        }}   
        onMouseOver={!disabled ? (e) => (e.target.style.background='linear-gradient(90deg, #45a049,#66BB6A)'):undefined}
        onMouseOut={!disabled ? (e) => (e.target.style.background='linear-gradient(90deg, #1914a1ff,#66BB6A)'):undefined}
        onFocus={!disabled ? (e) => (e.target.style.background='linear-gradient(90deg, #45a049,#66BB6A)'):undefined}
        onBlur={!disabled ? (e) => (e.target.style.background='linear-gradient(90deg, #45a049,#66BB6A)'):undefined} 
    >
        {children}        
    </button>
  )
}

export default Button