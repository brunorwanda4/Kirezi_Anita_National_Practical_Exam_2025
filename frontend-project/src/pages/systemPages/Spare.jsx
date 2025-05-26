import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SparePartForm from '../../components/forms/SparePartForm';
import Navbar from '../../components/Navbar';

const SpareParts = () => {
  

  return (
    <div >
        <Navbar/>
      <div className=" flex justify-center p-6">
        <div>
            <h1 className="text-2xl font-bold mb-4">Spare Parts</h1>
      <SparePartForm  />
      
        </div>
      </div>
    </div>
  );
};

export default SpareParts;
