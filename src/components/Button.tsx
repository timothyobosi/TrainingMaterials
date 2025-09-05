import React, { ReactNode, MouseEventHandler } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.6rem 1.4rem',
        margin: '0.5rem',
        fontSize: '1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#cccccc' : 'linear-gradient(90deg, #1914a1ff,#66BB6A)',
        color: 'white',
        border: 'none',
        borderRadius: '8px', // ✅ Fixed typo: no trailing comma
        transition: 'transform 0.2s, background 0.3s',
      }}
      onMouseOver={
        !disabled
          ? (e) =>
              ((e.target as HTMLButtonElement).style.background =
                'linear-gradient(90deg, #2f13baff,#66BB6A)')
          : undefined
      }
      onMouseOut={
        !disabled
          ? (e) =>
              ((e.target as HTMLButtonElement).style.background =
                'linear-gradient(90deg, #1914a1ff,#66BB6A)')
          : undefined
      }
      onFocus={
        !disabled
          ? (e) =>
              ((e.target as HTMLButtonElement).style.background =
                'linear-gradient(90deg, #45a049,#66BB6A)')
          : undefined
      }
      onBlur={
        !disabled
          ? (e) =>
              ((e.target as HTMLButtonElement).style.background =
                'linear-gradient(90deg, #45a049,#66BB6A)')
          : undefined
      }
    >
      {children}
    </button>
  );
};

export default Button;
