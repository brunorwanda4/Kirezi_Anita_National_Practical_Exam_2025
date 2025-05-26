import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import SparePartForm from '../../components/forms/SparePartForm'; // Adjust the import path as necessary
const SparePartsPage = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // For editing, you might add state like:
  // const [editingPart, setEditingPart] = useState(null);
  // const [showFormModal, setShowFormModal] = useState(false);


  const fetchSpareParts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/spare-parts');
      setSpareParts(response.data);
    } catch (err) {
      console.error('Failed to fetch spare parts:', err);
      setError(err.response?.data?.error || 'Could not load spare parts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const handleFormSuccess = () => {
    fetchSpareParts(); // Refresh data after adding/editing
    // setShowFormModal(false);
    // setEditingPart(null);
  };
  
  // Placeholder for delete and edit handlers
  const handleDelete = async (id) => { console.warn("Delete not implemented for spare part ID:", id); /* Implement deletion */ };
  const handleEdit = (part) => { console.warn("Edit not implemented for spare part:", part); /* setEditingPart(part); setShowFormModal(true); */ };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-content">Manage Spare Parts</h1>
        {/* <button className="btn btn-primary" onClick={() => { setEditingPart(null); setShowFormModal(true); }}>Add New Spare Part</button> */}
      </div>

      <SparePartForm onSuccess={handleFormSuccess} />
      {/* If using a modal for the form:
      {showFormModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg">
             <button onClick={() => { setShowFormModal(false); setEditingPart(null);}} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <SparePartForm onSuccess={handleFormSuccess} existingPart={editingPart} onCancelEdit={() => { setShowFormModal(false); setEditingPart(null);}} />
          </div>
        </div>
      )} */}


      {isLoading && <div className="text-center py-4"><span className="loading loading-lg loading-spinner text-primary"></span></div>}
      {error && <div role="alert" className="alert alert-error"><span>{error}</span></div>}
      
      {!isLoading && !error && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="table w-full table-zebra">
            <thead className="bg-neutral text-neutral-content">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                {/* <th>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {spareParts.length > 0 ? spareParts.map(part => (
                <tr key={part.id} className="hover">
                  <td>{part.id}</td>
                  <td>{part.name}</td>
                  <td>{part.category || 'N/A'}</td>
                  <td>{part.quantity}</td>
                  <td>${part.unit_price}</td>
                  {/* <td className="space-x-2">
                    <button onClick={() => handleEdit(part)} className="btn btn-xs btn-outline btn-info">Edit</button>
                    <button onClick={() => handleDelete(part.id)} className="btn btn-xs btn-outline btn-error">Delete</button>
                  </td> */}
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-4">No spare parts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default SparePartsPage;