import React from 'react';
import { Link } from 'react-router-dom';
import pic from "/vite.svg"
import {
  FaCut,
  FaUser,
  FaPalette,
  FaSpa,
  FaClinicMedical,
  FaSmileBeam,
  FaHandSparkles,
  FaBath,
  FaHandHoldingHeart,
  FaBox,
} from 'react-icons/fa';
import Pic from '../components/Pic';
import Card from '../components/Card';

const MainMenu = () => {
  const services = [
    "Hair Cut",
    "Shaving",
    "Hair Color & Fashion",
    "Fair Polish",
    "Hair Treatment",
    "Face & Skin Treatment",
    "Grooming Treatment",
    "Body Care",
    "Hand & Foot Care",
    "Packages",
  ];

  const links = [
    "/hair-cut",
    "#shaving",
    "#hair-color-fashion",
    "#fair-polish",
    "#hair-treatment",
    "#face-skin-treatment",
    "#grooming-treatment",
    "#body-care",
    "#hand-foot-care",
    "#packages",
  ];

  const icons = [
    <FaCut size={24} />,
    <FaUser size={24} />,
    <FaPalette size={24} />,
    <FaSpa size={24} />,
    <FaClinicMedical size={24} />,
    <FaSmileBeam size={24} />,
    <FaHandSparkles size={24} />,
    <FaBath size={24} />,
    <FaHandHoldingHeart size={24} />,
    <FaBox size={24} />,
  ];

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Salon Services
      </h2>

      <div className="divide-y divide-gray-200">
        {services.map((service, index) => (
          <div
            key={index}
            className="py-3 sm:py-4 flex items-center justify-between hover:bg-gray-100 rounded-xl px-3 transition"
          >
            <Link
              to={links[index]}
              className="flex items-center gap-3 text-gray-800 font-medium text-base sm:text-lg hover:text-pink-600 transition-colors"
            >
              <span className="text-pink-600">{icons[index]}</span>
              <span>{service}</span>
            </Link>
          </div>
        ))}
      </div>
      <Pic />
      <div className="flex justify-between ">
      <Card showButton='true' title='ura dhura chul cutting ' price={'100$'} className={'hi'}/>
      <Card showButton='true' title='ura dhura chul cutting ' price={'100$'}/>
      <Card showButton='true' title='ura dhura chul cutting ' price={'100$'}/>
      </div>
    </div>
  );
};

export default MainMenu;
