import React from 'react';

const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}
    {...props}
  />
);

export default Skeleton; 