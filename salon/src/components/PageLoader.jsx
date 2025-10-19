import React from "react";
import Card from "./Card";
import { Link } from "react-router-dom";

const PageLoader = ({ catalogItems = [] }) => {
  return (
    <section className="py-10 px-4 sm:px-6 md:px-10 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Page Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
          Salon Service Catalog
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Explore our exclusive range of grooming and beauty services ✂️✨
        </p>
      </div>

      {/* If no data is passed */}
      {catalogItems.length === 0 ? (
        <div className="text-center text-gray-500 italic">
          No services available right now...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
          {catalogItems.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      )}

       {/* Back to Home Button */}
       
      <div className="text-center mt-10">
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-gray-800 text-white text-sm sm:text-base rounded-lg hover:bg-gray-900 transition"
        >
          ⬅ Back to Home
        </Link>
      </div>


{/* const salonData = [
  {
    imgSrc: "/img/haircut.jpg",
    title: "Men's Premium Haircut",
    price: "৳500",
    showButton: true,
    link: "/services/haircut",
  },
  // ...other items
];

<PageLoader catalogItems={salonData} />; */}

    </section>
  );
};

export default PageLoader;
