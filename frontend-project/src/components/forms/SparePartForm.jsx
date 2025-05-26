import React, { useState, useEffect } from "react";
import apiClient from "../../api";

const SparePartForm = ({ onSuccess, existingPart, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    quantity: 0,
    unit_price: 0,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingPart) {
      setFormData({
        name: existingPart.name || "",
        category_id: existingPart.category_id || "",
        quantity: existingPart.quantity || 0,
        unit_price: existingPart.unit_price || 0,
      });
    } else {
      setFormData({ name: "", category_id: "", quantity: 0, unit_price: 0 });
    }
  }, [existingPart]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError("Could not load categories for the form.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "category_id" || name === "quantity" || name === "unit_price"
          ? Number(value)
          : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !formData.name ||
      !formData.category_id ||
      formData.quantity < 0 ||
      formData.unit_price < 0
    ) {
      setError(
        "Please fill all fields correctly. Quantity and price cannot be negative."
      );
      return;
    }
    setIsLoading(true);
    try {
      if (existingPart && existingPart.id) {
        // await apiClient.put(`/spare-parts/${existingPart.id}`, formData); // Assuming PUT endpoint for update
      } else {
        await apiClient.post("/spare-parts", formData);
      }
      onSuccess(); // Callback to refresh list or close modal
      setFormData({ name: "", category_id: "", quantity: 0, unit_price: 0 }); // Reset form
      if (onCancelEdit) onCancelEdit(); // Close edit form
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save spare part.");
      console.error("Spare part form error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg mb-6">
      <div className="card-body">
        <h2 className="card-title text-primary">
          {existingPart ? "Edit" : "Add New"} Spare Part
        </h2>
        {error && (
          <div className="alert alert-error shadow-sm my-2">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Spare Part Name"
              className="input input-bordered input-primary w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="select select-bordered select-primary w-full"
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Quantity</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered input-primary w-full"
              min="0"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Unit Price ($)</span>
            </label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="input input-bordered input-primary w-full"
              min="0"
              required
            />
          </div>
          <div className="card-actions justify-end">
            {existingPart && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : existingPart ? (
                "Save Changes"
              ) : (
                "Add Part"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SparePartForm;
