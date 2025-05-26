import React, { useState, useEffect } from 'react';
import apiClient from '../api';

const StockOutEditModal = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    spare_part_id: '',
    quantity: '',
    unit_price: '',
    date: '',
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
        console.error("Failed to fetch spare parts for edit modal", err);
      }
    };
    fetchSpareParts();

    if (item) {
      setFormData({
        spare_part_id: item.spare_part_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Corrected API endpoint
      await apiClient.put(`/stock-out/${item.id}`, {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        unit_price: parseFloat(formData.unit_price)
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update stock out record.');
      console.error("Stock out edit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg relative">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg text-primary mb-4">Edit Stock Out Record</h3>
        {error && <div className="alert alert-error shadow-sm my-2"><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Spare Part</span></label>
            <select 
              name="spare_part_id" 
              value={formData.spare_part_id} 
              onChange={handleChange} 
              className="select select-bordered select-primary w-full" 
              required
            >
              <option value="" disabled>Select Spare Part</option>
              {spareParts.map(part => (
                <option key={part.id} value={part.id}>
                  {part.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Quantity</span></label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input input-bordered input-primary w-full" min="1" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Selling Unit Price ($)</span></label>
            <input type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} step="0.01" className="input input-bordered input-primary w-full" min="0" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Date</span></label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input input-bordered input-primary w-full" required />
          </div>
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default StockOutEditModal;