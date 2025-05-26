import React, { useState } from 'react';
import axios from 'axios';

const StockOutEditModal = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: item.quantity,
    unitPrice: item.unitPrice
  });

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/stockout/${item.stockoutId}`, formData);
      onSuccess();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Stock Out</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Quantity</label>
            <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block">Unit Price</label>
            <input name="unitPrice" type="number" value={formData.unitPrice} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOutEditModal;
