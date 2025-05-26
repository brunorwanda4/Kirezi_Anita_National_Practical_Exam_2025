import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockInForm from '../../components/forms/StockInForm';
import Navbar from '../../components/Navbar';

const StockIn = () => {
  

  return (
    <div>
        <Navbar/>
        <div  className="flex justify-center pt-6">
            <div>
      <h1 className="text-2xl font-bold mb-4">Stock In</h1>
      <StockInForm  />
      
    </div>
        </div>
    </div>
  );
};

export default StockIn;
