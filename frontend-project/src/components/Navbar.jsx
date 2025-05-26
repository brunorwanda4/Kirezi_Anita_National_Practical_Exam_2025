import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BiMenu, BiX } from 'react-icons/bi'
import Logout from './Logout'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-black text-white font-medium p-4">
      <div className="flex justify-between items-center">
       
        <div>
          <Link to="/home" className="text-lg font-semibold">
            Smart Invetory M_SYST
            <span className="bg-white rounded text-black text-sm px-2 py-1 ml-1">EM</span>
          </Link>
        </div>

        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          {isOpen ? <BiX size={24} /> : <BiMenu size={24} />}
        </button>

        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/sparepart">SparePart</Link>
          <Link to="/stockin">StockIn</Link>
          <Link to="/stockout">StockOut</Link>
          <Link to="/rep">Report</Link>
          <Logout />
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 flex flex-col">
          <Link to="/sparepart" onClick={() => setIsOpen(false)}>SparePart</Link>
          <Link to="/stockin" onClick={() => setIsOpen(false)}>StockIn</Link>
          <Link to="/stockout" onClick={() => setIsOpen(false)}>StockOut</Link>
          <Link to="/rep" onClick={() => setIsOpen(false)}>Report</Link>
          <Logout />
        </div>
      )}
    </nav>
  )
}

export default Navbar
