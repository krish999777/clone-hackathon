// src/Pages/Donation.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Donation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foodItemName: '',
    quantity: '',
    vegNonVeg: 'Veg',
    preparedOn: '',
    expiryTime: '24',
    address: '',
    pickupName: '',
    pickupPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch current location
  const handleUseLocation = (e) => {
    if (!e.target.checked) {
      setFormData((prev) => ({ ...prev, address: '' }));
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      e.target.checked = false;
      return;
    }
    setIsFetchingLocation(true);
    setFormData((prev) => ({ ...prev, address: 'Fetching location...' }));

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            address: data.display_name || 'Could not determine address',
          }));
        } catch {
          setFormData((prev) => ({ ...prev, address: 'Failed to fetch address.' }));
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        toast.error(
          err.code === 1 ? 'Please allow location access.' : 'Could not get your location.'
        );
        setFormData((prev) => ({ ...prev, address: '' }));
        setIsFetchingLocation(false);
        e.target.checked = false;
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '...';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ✅ Updated handleSubmit with toast + reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const preparedDate = new Date(formData.preparedOn);
      const hoursToExpire = Number(formData.expiryTime);
      const expiryDate = new Date(
        preparedDate.getTime() + hoursToExpire * 60 * 60 * 1000
      );

      const donationData = {
        itemName: formData.foodItemName,
        meals: Number(formData.quantity),
        veg: formData.vegNonVeg === 'Veg',
        preparedOn: preparedDate,
        expiryOn: expiryDate,
        address: formData.address,
        contactName: formData.pickupName,
        contactPhone: formData.pickupPhone,
        contactType: 'Individual',
        status: 'notAccepted',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'donations'), donationData);

      // ✅ Show toast
      toast.success('🎉 Thank you! Your donation has been posted.');

      // ✅ Reset form
      setFormData({
        foodItemName: '',
        quantity: '',
        vegNonVeg: 'Veg',
        preparedOn: '',
        expiryTime: '24',
        address: '',
        pickupName: '',
        pickupPhone: '',
      });

      // ✅ Navigate after small delay
      setTimeout(() => navigate('/browse'), 1500);
    } catch (err) {
      console.error('Error:', err);
      setError('Could not submit donation. Please try again.');
      toast.error('❌ Could not submit donation. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container my-5">
      {/* Toast container */}
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h2 className="text-success text-center mb-4" style={{ fontWeight: 600 }}>
            Make a Donation 🌱
          </h2>
          <div className="row">
            {/* Left: Form */}
            <div className="col-md-7">
              <form onSubmit={handleSubmit}>
                <h6 className="mt-3 mb-3 text-muted">Food Details</h6>
                <div className="mb-3">
                  <label className="form-label">Food Item Name</label>
                  <input
                    type="text"
                    name="foodItemName"
                    className="form-control"
                    value={formData.foodItemName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Number of Meals (approx.)</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label d-block">Veg / Non-Veg</label>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      name="vegNonVeg"
                      value="Veg"
                      checked={formData.vegNonVeg === 'Veg'}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Veg</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      name="vegNonVeg"
                      value="Non-Veg"
                      checked={formData.vegNonVeg === 'Non-Veg'}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Non-Veg</label>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <label className="form-label">Prepared On</label>
                    <input
                      type="date"
                      name="preparedOn"
                      className="form-control"
                      value={formData.preparedOn}
                      onChange={handleChange}
                      max={today}
                      required
                    />
                  </div>
                  <div className="col-sm-6 mb-3">
                    <label className="form-label">Expires In</label>
                    <select
                      name="expiryTime"
                      className="form-select"
                      value={formData.expiryTime}
                      onChange={handleChange}
                    >
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours (1 Day)</option>
                      <option value="48">48 Hours (2 Days)</option>
                    </select>
                  </div>
                </div>

                <h6 className="mt-4 mb-3 text-muted">Pickup Location</h6>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={handleUseLocation}
                      disabled={isFetchingLocation}
                    />
                    <label className="form-check-label">Use my current location</label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="pickupName"
                    className="form-control"
                    value={formData.pickupName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="pickupPhone"
                    className="form-control"
                    value={formData.pickupPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <button
                  type="submit"
                  className="btn w-100 mt-4"
                  style={{ backgroundColor: '#348c64', color: 'white' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Donation'}
                </button>
              </form>
            </div>

            {/* Right: Donation summary */}
            <div className="col-md-5">
              <div
                className="p-3 rounded-3"
                style={{
                  backgroundColor: '#f3f9f9',
                  border: '1px solid #d0e0e0',
                  height: '100%',
                  fontSize: '0.9rem',
                }}
              >
                <h5 className="mb-3" style={{ color: '#348c64' }}>
                  Donation Summary
                </h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Food Item</span>
                  <strong>{formData.foodItemName || '...'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Quantity</span>
                  <strong>{formData.quantity || '...'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Veg / Non-Veg</span>
                  <strong>{formData.vegNonVeg}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Prepared On</span>
                  <strong>{formatDate(formData.preparedOn)}</strong>
                </div>
                <div className="d-flex justify-content-between mt-3 mb-2">
                  <span className="text-muted">Address</span>
                  <strong>{formData.address || '...'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Name</span>
                  <strong>{formData.pickupName || '...'}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Phone</span>
                  <strong>{formData.pickupPhone || '...'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default Donation;
