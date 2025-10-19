import React from 'react';
import defaultImg from '/kechi.jpg'; // adjust path if needed

const Pic = ({ src, alt }) => {
  

  return (
    <picture className="w-full h-40 sm:h-48 md:h-56 overflow-hidden rounded-lg bg-gray-100">
      <img
        src={src || defaultImg}
        alt={alt || "Default Image"}
        className="w-full h-full object-cover"
      />
    </picture>
  );
};

export default Pic;
