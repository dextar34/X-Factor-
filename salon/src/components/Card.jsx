import React from "react";
import Pic from "./Pic";
import { Link } from "react-router-dom";

const Card = ({ imgSrc, imgAlt, title, price, showButton = false, link = "#", className }) => {
  return (
    <div className={`bg-white shadow-lg my-2 mx-1 rounded-xl p-4 w-full max-w-xs sm:max-w-sm hover:shadow-2xl transition duration-300 flex flex-col ${className}`}>
      
      {/* Image Section */}
      <Pic src={imgSrc} alt={imgAlt} />

      {/* Content Section */}
      <div className="mt-4 text-center flex flex-col flex-grow">
        {/* Title (Fixed Height to Avoid Card Size Change) */}
        <h2
          className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2 h-12 overflow-hidden"
          title={title}
        >
          {title}
        </h2>

        {/* Price */}
        <p className="text-gray-700 text-sm sm:text-base mt-1 font-medium">
          💰 {price}
        </p>

        {/* Optional Link Button */}
        {showButton && (
          <Link
            to={link}
            className="mt-auto inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Know More
          </Link>
        )}
      </div>
    </div>
  );
};

export default Card;
