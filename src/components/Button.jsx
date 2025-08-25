import React from 'react'

const Button = ({children, onClick, disabled}) => {
  return (
    <button
    onClick = {onClick}
        diabled = {disabled}
        style ={{
            padding: '0.5rem 1rem',
            margin: '0.5rem',
            fontsize: '1rem',
            cursor: disabled ? 'not-allowed':'pointer',
            backgroundcolor:disabled ? '#cccccc' : '#4CAF50',
            color: 'white',
            border:'none',
            borderRadius:'4px,'
        }}    
    >
        {children}        
    </button>
  )
}

export default Button