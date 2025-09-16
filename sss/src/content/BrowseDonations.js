import React, { useEffect, useState, useCallback } from 'react';
import {
  MapPinIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  TruckIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import './BrowseDonations.css';

// =================================================================================
// Utility Functions
// =================================================================================
const deg2rad = (d) => d * (Math.PI / 180);
const getDistanceFromCoords = (coords1, coords2) => {
  if (!coords1 || !coords2) return Math.round((Math.random() * 11 + 0.3) * 10) / 10;
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(coords2.lat - coords1.lat);
  const dLon = deg2rad(coords2.lon - coords1.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1.lat)) *
      Math.cos(deg2rad(coords2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};
const getTimeToExpiryMs = (expiryOn) => {
  if (!expiryOn) return Infinity;
  return new Date(expiryOn).getTime() - Date.now();
};
const parseCoordsFromAddress = (address) => {
  if (!address) return null;
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
    return { lat: Number(parts[0]), lon: Number(parts[1]) };
  }
  return null;
};
const getStatusBadge = (status) => {
  if (status === 'notAccepted')
    return { text: 'Available', icon: <ArrowsRightLeftIcon className="icon-badge" />, type: 'gray' };
  if (status === 'pickingUp')
    return { text: 'Pick Up In Progress', icon: <TruckIcon className="icon-badge" />, type: 'amber' };
  if (status === 'completed')
    return { text: 'Completed', icon: <CheckBadgeIcon className="icon-badge" />, type: 'emerald' };
  return { text: '', icon: null, type: '' };
};
function timeLabel(expiryOn) {
  if (!expiryOn) return '—';
  
  const expiryDate = new Date(expiryOn);
  const now = new Date();
  
  // Calculate time remaining in milliseconds
  const timeRemaining = expiryDate.getTime() - now.getTime();
  
  // If expired, show "Expired"
  if (timeRemaining <= 0) return 'Expired';
  
  // Convert to different time units
  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Format time remaining
  if (minutes < 1) return 'Expires now';
  if (minutes < 60) return `Expires in ${minutes} min`;
  if (hours < 24) return `Expires in ${hours} hr`;
  if (days < 7) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  
  // For longer periods, show date and time
  const timeString = expiryDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const dateString = expiryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  return `${dateString} ${timeString}`;
}

// =================================================================================
// useDonations Hook
// =================================================================================
function useDonations() {
  const [allDonations, setAllDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredAndSorted, setFilteredAndSorted] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'time',
    vegOnly: false,
    minMeals: 1,
    query: ''
  });

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.warn('Error getting location:', error);
        setIsGettingLocation(false);
      }
    );
  }, []);

  useEffect(() => {
    let isActive = true;
    const fetchDonations = async () => {
      try {
        const res = await fetch('/api/donations');
        const data = await res.json();
        if (!isActive) return;
        const normalized = (data || []).map((d) => ({
          ...d,
          preparedOn: d.preparedOn ? new Date(d.preparedOn) : undefined,
          expiryOn: d.expiryOn ? new Date(d.expiryOn) : undefined,
          createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          coords: d.coordinates || parseCoordsFromAddress(d.address)
        }));
        setAllDonations(normalized);
      } catch (error) {
        console.error('API fetch error:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    fetchDonations();
    const intervalId = setInterval(fetchDonations, 10000);
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let out = allDonations.map((d) => ({
      ...d,
      _timeToExpiry: getTimeToExpiryMs(d.expiryOn),
      _distanceKm: userLocation ? getDistanceFromCoords(userLocation, d.coords) : Math.round((Math.random() * 11 + 0.3) * 10) / 10
    }));

    if (filters.vegOnly) out = out.filter((d) => d.veg === true);
    if (filters.minMeals) out = out.filter((d) => Number(d.meals || 0) >= Number(filters.minMeals || 0));
    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      out = out.filter(
        (d) =>
          (d.itemName || '').toLowerCase().includes(q) ||
          (d.contactName || '').toLowerCase().includes(q)
      );
    }

    if (filters.sortBy === 'meals') out.sort((a, b) => Number(b.meals || 0) - Number(a.meals || 0));
    if (filters.sortBy === 'distance') out.sort((a, b) => a._distanceKm - b._distanceKm);
    if (filters.sortBy === 'time') out.sort((a, b) => a._timeToExpiry - b._timeToExpiry);

    setFilteredAndSorted(out);
  }, [allDonations, filters, userLocation]);

  const updateDonationStatus = useCallback(async (dId, status) => {
    try {
      const res = await fetch(`/api/donations/${encodeURIComponent(dId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed');
      // Optimistically update local state
      setAllDonations((prev) => prev.map((d) => (d.id === dId ? { ...d, status } : d)));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update donation status.');
    }
  }, []);

  return {
    filters,
    setFilters,
    filteredAndSorted,
    updateDonationStatus,
    isLoading,
    getUserLocation,
    userLocation,
    isGettingLocation
  };
}

// =================================================================================
// Component
// =================================================================================
export default function BrowseDonations() {
  const { 
    filters, 
    setFilters, 
    filteredAndSorted, 
    updateDonationStatus, 
    isLoading, 
    getUserLocation, 
    userLocation, 
    isGettingLocation 
  } = useDonations();

  const handleAccept = useCallback(
    (dId) => {
      updateDonationStatus(dId, 'pickingUp');
    },
    [updateDonationStatus]
  );

  const handleComplete = useCallback(
    (dId) => {
      updateDonationStatus(dId, 'completed');
    },
    [updateDonationStatus]
  );

  return (
    <div className="browse-donations-page">
      <main className="main-content">
        <div className="container main-layout">
          {/* Sidebar */}
          <aside className="filter-sidebar">
            <h3 className="sidebar-title">Filters</h3>
            <div className="filter-group">
              <label htmlFor="sortBy">Sort By</label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="time">Expires Soonest</option>
                <option value="distance">Closest</option>
                <option value="meals">Highest Quantity</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Food Type</label>
              <div className="checkbox-control">
                <input
                  id="vegOnly"
                  type="checkbox"
                  checked={filters.vegOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, vegOnly: e.target.checked }))}
                />
                <label htmlFor="vegOnly">Veg Only</label>
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="minMeals">Minimum Meal Quantity</label>
              <input
                id="minMeals"
                type="number"
                min="1"
                value={filters.minMeals}
                onChange={(e) => setFilters((prev) => ({ ...prev, minMeals: e.target.value }))}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="searchQuery">Search</label>
              <div className="search-control">
                <MagnifyingGlassIcon className="search-icon" />
                <input
                  id="searchQuery"
                  placeholder="Food item or donor name"
                  value={filters.query}
                  onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Location</label>
              <button 
                className="location-button"
                onClick={getUserLocation}
                disabled={isGettingLocation}
              >
                <MapPinIcon className="location-icon" />
                {isGettingLocation ? 'Getting Location...' : userLocation ? 'Location Detected' : 'Use My Location'}
              </button>
              {userLocation && (
                <div className="location-info">
                  <small>Location detected! Distance sorting is now accurate.</small>
                </div>
              )}
            </div>
          </aside>

          {/* Donations Grid */}
          <div className="content-panel">
            {isLoading ? (
              <div className="no-donations-card">
                <h3 className="no-donations-title">Loading Donations...</h3>
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="no-donations-card">
                <CheckCircleIcon className="no-donations-icon" />
                <h3 className="no-donations-title">All caught up!</h3>
                <p>No donations currently match your filters.</p>
              </div>
            ) : (
              <div className="donations-grid">
                {filteredAndSorted.map((donation) => {
                  const { text: statusText, icon: statusIcon, type: statusType } = getStatusBadge(donation.status);
                  return (
                    <div key={donation.id} className="donation-card">
                      <div className="card-top-section">
                        <div className="card-details">
                          <h2 className="card-title">{donation.itemName}</h2>
                          <div className="details-grid">
                            <div className="detail-label">Meals</div>
                            <div className="detail-value">{donation.meals || '—'}</div>
                            <div className="detail-label">Type</div>
                            <div className="detail-value">{donation.veg ? 'Veg' : 'Non-Veg'}</div>
                            <div className="detail-label">Expires In</div>
                            <div className="detail-value">{timeLabel(donation.expiryOn)}</div>
                            <div className="detail-label">Donor</div>
                            <div className="detail-value">{donation.contactName || '—'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="card-bottom-section">
                        <div className={`status-badge status-${statusType}`}>
                          {statusIcon} {statusText}
                        </div>
                        <div className="action-buttons">
                          {donation.status === 'notAccepted' && (
                            <button className="btn btn-primary" onClick={() => handleAccept(donation.id)}>
                              Accept Donation
                            </button>
                          )}
                          {donation.status === 'pickingUp' && (
                            <button className="btn btn-secondary" onClick={() => handleComplete(donation.id)}>
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
