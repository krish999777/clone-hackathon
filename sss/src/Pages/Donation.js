// src/Pages/Donation.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Firestore in favor of simple JSON API
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
  const [errors, setErrors] = useState({});
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  

  // Validation helpers
  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toISOString().slice(0, 10);
  };

  const validate = (values) => {
    const newErrors = {};

    // Food item name: should not contain numbers
    if (!values.foodItemName || !/^[A-Za-z\s]+$/.test(values.foodItemName)) {
      newErrors.foodItemName = 'Food item name must contain only letters and spaces.';
    }

    // Pickup name: should not contain numbers
    if (!values.pickupName || !/^[A-Za-z\s]+$/.test(values.pickupName)) {
      newErrors.pickupName = 'Name must contain only letters and spaces.';
    }

    // Number of meals: must be a number and > 0
    if (!/^\d+$/.test(String(values.quantity))) {
      newErrors.quantity = 'Number of meals must be a valid number.';
    } else if (Number(values.quantity) <= 0) {
      newErrors.quantity = 'Number of meals must be greater than 0.';
    }

    // Prepared On: only today, yesterday, or exactly 2 days before today allowed
    if (!values.preparedOn) {
      newErrors.preparedOn = 'Please select the prepared date.';
    } else {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      const twoDaysBefore = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
      const twoDaysBeforeStr = twoDaysBefore.toISOString().slice(0, 10);
      const candidate = normalizeDate(values.preparedOn);
      if (candidate !== todayStr && candidate !== yesterdayStr && candidate !== twoDaysBeforeStr) {
        newErrors.preparedOn = 'Prepared date must be today, yesterday, or 2 days before.';
      }
    }

    // Phone: exactly 10 digits (sanitize non-digits before check)
    const sanitizedPhone = String(values.pickupPhone || '').replace(/\D/g, '');
    if (!/^\d{10}$/.test(sanitizedPhone)) {
      newErrors.pickupPhone = 'Phone number must be exactly 10 digits.';
    }

    return newErrors;
  };

  const hasErrors = (errs) => Object.keys(errs).length > 0;

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'pickupPhone') {
      // keep only digits and clamp to 10
      nextValue = String(value).replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'quantity') {
      // keep only digits, allow empty, no leading zeros normalization
      nextValue = String(value).replace(/\D/g, '');
    }
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    // live-validate the changed field
    setErrors((prev) => {
      const updated = { ...prev };
      const draft = { ...formData, [name]: nextValue };
      const v = validate(draft);
      return v;
    });
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
      // Validate
      const v = validate(formData);
      setErrors(v);
      if (hasErrors(v)) {
        toast.error('Please fix the highlighted errors before submitting.');
        setIsSubmitting(false);
        return;
      }

      const preparedDate = new Date(formData.preparedOn);
      const hoursToExpire = Number(formData.expiryTime);
      const expiryDate = new Date(
        preparedDate.getTime() + hoursToExpire * 60 * 60 * 1000
      );

      const donationData = {
        itemName: formData.foodItemName,
        meals: Number(formData.quantity),
        veg: formData.vegNonVeg === 'Veg',
        preparedOn: preparedDate.toISOString(),
        expiryOn: expiryDate.toISOString(),
        address: formData.address,
        contactName: formData.pickupName,
        contactPhone: formData.pickupPhone,
        contactType: 'Individual',
        status: 'notAccepted',
        createdAt: new Date().toISOString(),
        
      };

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });
      if (!res.ok) throw new Error('API error');

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
      setErrors({});
      

      // ✅ Navigate after small delay
      setTimeout(() => navigate('/browsedonation'), 1500);
    } catch (err) {
      console.error('Error:', err);
      setError('Could not submit donation. Please try again.');
      toast.error('❌ Could not submit donation. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const twoDaysBeforeStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

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
                    className={`form-control ${errors.foodItemName ? 'is-invalid' : ''}`}
                    pattern="[A-Za-z\s]+"
                    title="Only letters and spaces are allowed"
                    value={formData.foodItemName}
                    onChange={handleChange}
                    required
                  />
                  {errors.foodItemName && (
                    <div className="invalid-feedback">{errors.foodItemName}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Number of Meals (approx.)</label>
                  <input
                    type="number"
                    name="quantity"
                    className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                  {errors.quantity && (
                    <div className="invalid-feedback">{errors.quantity}</div>
                  )}
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
                    <select
                      name="preparedOn"
                      className={`form-select ${errors.preparedOn ? 'is-invalid' : ''}`}
                      value={formData.preparedOn}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select prepared date</option>
                      <option value={today}>{today}</option>
                      <option value={yesterdayStr}>{yesterdayStr}</option>
                      <option value={twoDaysBeforeStr}>{twoDaysBeforeStr}</option>
                    </select>
                    {errors.preparedOn && (
                      <div className="invalid-feedback">{errors.preparedOn}</div>
                    )}
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
                    className={`form-control ${errors.pickupName ? 'is-invalid' : ''}`}
                    pattern="[A-Za-z\s]+"
                    title="Only letters and spaces are allowed"
                    value={formData.pickupName}
                    onChange={handleChange}
                    required
                  />
                  {errors.pickupName && (
                    <div className="invalid-feedback">{errors.pickupName}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="pickupPhone"
                    className={`form-control ${errors.pickupPhone ? 'is-invalid' : ''}`}
                    value={formData.pickupPhone}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                  {errors.pickupPhone && (
                    <div className="invalid-feedback">{errors.pickupPhone}</div>
                  )}
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
