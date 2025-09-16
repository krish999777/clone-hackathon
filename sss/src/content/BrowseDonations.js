import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
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
const getDistanceFromCoords = (coords) => {
  const MUMBAI_CENTER = { lat: 19.0760, lon: 72.8777 };
  if (!coords) return Math.round((Math.random() * 11 + 0.3) * 10) / 10;
  const R = 6371;
  const dLat = deg2rad(coords.lat - MUMBAI_CENTER.lat);
  const dLon = deg2rad(coords.lon - MUMBAI_CENTER.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(MUMBAI_CENTER.lat)) *
      Math.cos(deg2rad(coords.lat)) *
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
  const ms = getTimeToExpiryMs(expiryOn);
  if (ms === Infinity) return '—';
  if (ms <= 0) return 'Expired';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'Expires now';
  if (minutes < 60) return `In ${minutes} min`;
  if (hours < 24) return `In ${hours} hr`;
  return `In ${days} d`;
}
function generatePlaceholderImage(text) {
  const q = encodeURIComponent(text || 'food');
  return `https://source.unsplash.com/random/400x400/?${q}`;
}

// =================================================================================
// useDonations Hook
// =================================================================================
function useDonations() {
  const [allDonations, setAllDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredAndSorted, setFilteredAndSorted] = useState([]);
  const [filters, setFilters] = useState({
    sortBy: 'time',
    vegOnly: false,
    minMeals: 1,
    query: ''
  });

  useEffect(() => {
    const donationsCollectionRef = collection(db, 'donations');
    const q = query(donationsCollectionRef, where('status', '==', 'notAccepted'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const donationsData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          preparedOn: d.data().preparedOn?.toDate(),
          expiryOn: d.data().expiryOn?.toDate(),
          createdAt: d.data().createdAt?.toDate()
        }));

        const normalized = donationsData.map((d) => ({
          ...d,
          coords: parseCoordsFromAddress(d.address)
        }));

        setAllDonations(normalized);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firebase fetch error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let out = allDonations.map((d) => ({
      ...d,
      _timeToExpiry: getTimeToExpiryMs(d.expiryOn),
      _distanceKm: getDistanceFromCoords(d.coords)
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
  }, [allDonations, filters]);

  const updateDonationStatus = useCallback(async (dId, status) => {
    const donationDocRef = doc(db, 'donations', dId);
    try {
      await updateDoc(donationDocRef, { status: status });
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
    isLoading
  };
}

// =================================================================================
// Component
// =================================================================================
export default function BrowseDonations() {
  const { filters, setFilters, filteredAndSorted, updateDonationStatus, isLoading } = useDonations();

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
                        <div className="card-image-wrapper">
                          <img
                            alt={donation.itemName}
                            className="card-image"
                            src={generatePlaceholderImage(donation.itemName)}
                          />
                        </div>
                        <div className="card-details">
                          <h2 className="card-title">{donation.itemName}</h2>
                          <div className="details-grid">
                            <div className="detail-label">Meals</div>
                            <div className="detail-value">{donation.meals || '—'}</div>
                            <div className="detail-label">Type</div>
                            <div className="detail-value">{donation.veg ? 'Veg' : 'Non-Veg'}</div>
                            <div className="detail-label">Expires</div>
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
