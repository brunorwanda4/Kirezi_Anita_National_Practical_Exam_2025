import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StockInForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    spareId: '',
    quantity: '',
    date: ''
  });

  const [spareParts, setSpareParts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/spareparts')
      .then(res => setSpareParts(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to fetch spare parts.');
      });
  }, []);

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/stockin', formData);
      setFormData({ spareId: '', quantity: '', date: '' });
      onSuccess();
      setMessage(res.data.message || 'Stock in successful');
      setError('');
    } catch (err) {
      console.error('Error in stock in:', err);
      setError(err.response?.data?.message || 'Failed to stock in');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md w-96 space-y-4">
      {message && <div className="text-green-600 font-semibold">{message}</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}

      <div>
        <label className="block">Spare Part</label>
        <select
          name="spareId"
          value={formData.spareId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select</option>
          {spareParts.map(part => (
            <option key={part.spareId} value={part.spareId}>
              {part.name}
            </option>
          ))}
        </select>
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
        <label className="block">Date</label>
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Add to Stock
      </button>
    </form>
  );
};

export default StockInForm;
