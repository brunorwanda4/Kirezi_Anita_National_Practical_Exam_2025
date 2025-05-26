import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockOutForm from '../../components/forms/StockOutForm';
import StockOutEditModal from '../../components/StockOutEditModal';
import Navbar from '../../components/Navbar';

const StockOut = () => {
  const [stockOutData, setStockOutData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchStockOut();
  }, []);

  const fetchStockOut = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stockout');
      setStockOutData(res.data);
    } catch (err) {
      console.error('Failed to load stock out data:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stockout/${id}`);
        fetchStockOut();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  return (
    <div>
        <Navbar/>
        <div className='flex justify-center pt-6'>
            <div>
                <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Out</h1>
      <StockOutForm onSuccess={fetchStockOut} />
      <table className="w-full mt-6 border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Spare Part</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Unit Price</th>
            <th className="p-2">Total</th>
            <th className="p-2">Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stockOutData.map(item => (
            <tr key={item.stockoutId} className="border-t">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">{item.unitPrice}</td>
              <td className="p-2">{item.totalPrice}</td>
              <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(item.stockoutId)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editModalOpen && (
        <StockOutEditModal
          item={selectedItem}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            fetchStockOut();
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
            </div>
        </div>
    </div>
  );
};

export default StockOut;
