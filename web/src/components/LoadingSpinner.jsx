import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '20px', height: '20px', border: '2px solid rgba(176, 0, 232, 0.1)' };
      case 'large':
        return { width: '60px', height: '60px', border: '6px solid rgba(176, 0, 232, 0.1)' };
      case 'medium':
      default:
        return { width: '40px', height: '40px', border: '4px solid rgba(176, 0, 232, 0.1)' };
    }
  };

  const spinnerStyle = {
    ...getSize(),
    borderRadius: '50%',
    borderTopColor: '#b000e8',
    animation: 'spin 1s ease-in-out infinite'
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner" style={spinnerStyle}></div>
    </div>
  );
};

export default LoadingSpinner;