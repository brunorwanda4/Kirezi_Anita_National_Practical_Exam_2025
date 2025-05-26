import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

const StockOutForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    spare_part_id: '',
    quantity: '',
    unit_price: '', // Selling price
    date: new Date().toISOString().split('T')[0],
  });
  const [spareParts, setSpareParts] = useState([]);
  const [selectedPartDetails, setSelectedPartDetails] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const response = await apiClient.get('/spare-parts');
        setSpareParts(response.data);
      } catch (err) {
        console.error("Failed to fetch spare parts for stock out form", err);
        setError("Could not load spare parts.");
      }
    };
    fetchSpareParts();
  }, []);
  
  const handlePartChange = (e) => {
    const partId = e.target.value;
    const part = spareParts.find(p => p.id.toString() === partId);
    setSelectedPartDetails(part);
    setFormData(prev => ({ 
        ...prev, 
        spare_part_id: partId,
        // Optionally prefill unit_price from spare part's cost price, but allow override for selling price
        unit_price: part ? part.unit_price : '' 
    }));
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.spare_part_id || !formData.quantity || formData.quantity <= 0 || !formData.unit_price || formData.unit_price < 0) {
      setError("Please select a spare part and enter valid quantity and selling price.");
      return;
    }
    if (selectedPartDetails && parseInt(formData.quantity, 10) > selectedPartDetails.quantity) {
        setError(`Insufficient stock. Available: ${selectedPartDetails.quantity}`);
        return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/stock-out', {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        unit_price: parseFloat(formData.unit_price)
      });
      onSuccess();
      setFormData({ spare_part_id: '', quantity: '', unit_price: '', date: new Date().toISOString().split('T')[0] });
      setSelectedPartDetails(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record stock out.');
      console.error("Stock out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg mb-6">
      <div className="card-body">
        <h2 className="card-title text-primary">Record Stock Out</h2>
        {error && <div className="alert alert-error shadow-sm my-2"><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Spare Part</span></label>
            <select name="spare_part_id" value={formData.spare_part_id} onChange={handlePartChange} className="select select-bordered select-primary w-full" required>
              <option value="" disabled>Select Spare Part</option>
              {spareParts.map(part => <option key={part.id} value={part.id}>{part.name} (Available: {part.quantity})</option>)}
            </select>
             {selectedPartDetails && <p className="text-xs mt-1">Current stock: {selectedPartDetails.quantity}, Cost Price: ${selectedPartDetails.unit_price }</p>}
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Quantity</span></label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Enter quantity" className="input input-bordered input-primary w-full" min="1" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Selling Unit Price ($)</span></label>
            <input type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} placeholder="0.00" step="0.01" className="input input-bordered input-primary w-full" min="0" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Date</span></label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input input-bordered input-primary w-full" required />
          </div>
          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner"></span> : 'Record Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default StockOutForm;