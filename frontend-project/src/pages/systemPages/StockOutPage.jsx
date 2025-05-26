import React, { useEffect, useState } from 'react';
import apiClient from '../../api';
import StockOutForm from '../../components/forms/StockOutForm';
import StockOutEditModal from '../../components/StockOutEditModal';

const StockOutPage = () => {
  const [stockOutData, setStockOutData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);


  const fetchStockOut = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Corrected API endpoint
      const res = await apiClient.get('/stock-out');
      setStockOutData(res.data);
    } catch (err) {
      console.error('Failed to load stock out data:', err);
      setError(err.response?.data?.error || 'Could not load stock out records.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStockOut();
  }, []);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setShowConfirmModal(false);
    setIsLoading(true); // Consider a specific loading state for delete
    try {
      // Corrected API endpoint
      await apiClient.delete(`/stock-out/${itemToDelete}`);
      fetchStockOut(); // Refresh data
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.error || 'Failed to delete record.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleFormSuccess = () => {
    fetchStockOut();
  };
  
  const handleEditSuccess = () => {
    fetchStockOut();
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-content">Stock Out Records</h1>
      <StockOutForm onSuccess={handleFormSuccess} />

      {isLoading && !stockOutData.length && <div className="text-center py-4"><span className="loading loading-lg loading-spinner text-primary"></span></div>}
      {error && <div role="alert" className="alert alert-error"><span>{error}</span></div>}

      {!isLoading && !error && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="table w-full table-zebra">
            <thead className="bg-neutral text-neutral-content">
              <tr>
                <th>ID</th>
                <th>Spare Part</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockOutData.length > 0 ? stockOutData.map(item => (
                <tr key={item.id} className="hover">
                  <td>{item.id}</td>
                  <td>{item.spare_part_name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price }</td>
                  <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td className="space-x-1">
                    <button onClick={() => openEdit(item)} className="btn btn-xs btn-outline btn-info">Edit</button>
                    <button onClick={() => handleDeleteClick(item.id)} className="btn btn-xs btn-outline btn-error">Delete</button>
                  </td>
                </tr>
              )) : (
                 <tr><td colSpan="8" className="text-center py-4">No stock out records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editModalOpen && selectedItem && (
        <StockOutEditModal
          item={selectedItem}
          onClose={() => { setEditModalOpen(false); setSelectedItem(null); }}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {/* Confirmation Modal for Delete */}
      {showConfirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this stock out record? This action cannot be undone and will restore the stock quantity.</p>
            <div className="modal-action">
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={confirmDelete} className="btn btn-error">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StockOutPage;