import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Optionally remove user info from localStorage if stored
    // localStorage.removeItem('user');
    navigate("/");
  };

  return (
    <div className="navbar bg-primary text-primary-content shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 text-base-content rounded-box w-52"
          >
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/spare-parts">Spare Parts</Link>
            </li>
            <li>
              <Link to="/stock-in">Stock In</Link>
            </li>
            <li>
              <Link to="/stock-out">Stock Out</Link>
            </li>
            <li>
              <Link to="/reports">Reports</Link>
            </li>
          </ul>
        </div>
        <Link to="/home" className="btn btn-ghost normal-case text-xl">
          InvSys Pink
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/home" className="btn btn-ghost">
              Home
            </Link>
          </li>
          <li>
            <Link to="/spare-parts" className="btn btn-ghost">
              Spare Parts
            </Link>
          </li>
          <li>
            <Link to="/stock-in" className="btn btn-ghost">
              Stock In
            </Link>
          </li>
          <li>
            <Link to="/stock-out" className="btn btn-ghost">
              Stock Out
            </Link>
          </li>
          <li>
            <Link to="/reports" className="btn btn-ghost">
              Reports
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
export default Navbar;
