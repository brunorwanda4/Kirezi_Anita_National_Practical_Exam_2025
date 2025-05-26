import React, { useState } from 'react';
import axios from 'axios';

const SparePartForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unitPrice: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/spareparts', formData);
      setFormData({ name: '', category: '', quantity: '', unitPrice: '' });
      onSuccess();
      setMessage(res.data.message || 'Spare part added successfully');
      setError('');
    } catch (err) {
      console.error('Error adding spare part:', err);
      setError(err.response?.data?.message || 'Failed to add spare part');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded w-96 shadow-md space-y-4">
      {message && <div className="text-green-600 font-semibold">{message}</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}
      <div>
        <label className="block">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block">Category</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block">Quantity</label>
        <input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block">Unit Price</label>
        <input
          name="unitPrice"
          type="number"
          value={formData.unitPrice}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Spare Part
      </button>
    </form>
  );
};

export default SparePartForm;
