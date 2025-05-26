import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

const StockInForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    spare_part_id: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [spareParts, setSpareParts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const response = await apiClient.get('/spare-parts');
        setSpareParts(response.data);
      } catch (err) {
        console.error("Failed to fetch spare parts for stock in form", err);
        setError("Could not load spare parts.");
      }
    };
    fetchSpareParts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.spare_part_id || !formData.quantity || formData.quantity <= 0) {
      setError("Please select a spare part and enter a valid quantity.");
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/stock-in', {
        ...formData,
        quantity: parseInt(formData.quantity, 10) // Ensure quantity is a number
      });
      onSuccess(); // Callback to refresh list or show message
      setFormData({ spare_part_id: '', quantity: '', date: new Date().toISOString().split('T')[0] }); // Reset form
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record stock in.');
      console.error("Stock in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg mb-6">
      <div className="card-body">
        <h2 className="card-title text-primary">Record Stock In</h2>
        {error && <div className="alert alert-error shadow-sm my-2"><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Spare Part</span></label>
            <select name="spare_part_id" value={formData.spare_part_id} onChange={handleChange} className="select select-bordered select-primary w-full" required>
              <option value="" disabled>Select Spare Part</option>
              {spareParts.map(part => <option key={part.id} value={part.id}>{part.name} (Qty: {part.quantity})</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Quantity</span></label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Enter quantity" className="input input-bordered input-primary w-full" min="1" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Date</span></label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input input-bordered input-primary w-full" required />
          </div>
          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner"></span> : 'Record Stock In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default StockInForm;