import React from 'react';

const CheckIcon = ({ className = "", style = {} }) => {
  return (
    <svg 
      width="19" 
      height="18" 
      viewBox="0 0 19 18" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path 
        d="M16.5 0H2.5C1.39 0 0.5 0.9 0.5 2V16C0.5 17.1 1.39 18 2.5 18H16.5C17.61 18 18.5 17.1 18.5 16V2C18.5 0.9 17.61 0 16.5 0ZM7.5 14L2.5 9L3.91 7.59L7.5 11.17L15.09 3.58L16.5 5L7.5 14Z" 
        fill="#796060"
      />
    </svg>
  );
};

export default CheckIcon;
