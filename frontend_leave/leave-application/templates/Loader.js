import React from 'react';
import { FaSchool } from 'react-icons/fa';  // College icon
import { FaHome } from 'react-icons/fa';  // Home icon
import { FaWalking } from 'react-icons/fa';  // Walking person icon
import './Loader.css';  // Import the CSS file for loader styles

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="road">
        <div className="college">
          <FaSchool size={40} /> College
        </div>
        <div className="student">
          <FaWalking size={30} />
        </div>
        <div className="home">
          <FaHome size={40} /> Home
        </div>
      </div>
    </div>
  );
};

export default Loader;
