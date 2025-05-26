import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // const user = JSON.parse(localStorage.getItem('user')); // If user info stored
  return (
    <div className="hero min-h-[calc(100vh-10rem)] bg-base-100 rounded-box shadow-xl">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary">Welcome!</h1>
          <p className="py-6 text-lg">
            You've successfully logged into the Smart Inventory Management System.
            Use the navigation bar to manage spare parts, stock, and reports.
          </p>
          <Link to="/spare-parts" className="btn btn-primary">Manage Spare Parts</Link>
        </div>
      </div>
    </div>
  );
};
export default Home;
