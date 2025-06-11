import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, data } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';
import APIRoutes from '../utils/APIRoutes';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import socket from '../utils/socket';

export default function Bidding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [biddingEndTime, setBiddingEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBid, setCurrentBid] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  const [myBid, setMyBid] = useState('');

  useEffect(() => {
    if (!biddingEndTime) return;
    const intervalId = setInterval(() => {
      const now = new Date();
      const diff = new Date(biddingEndTime) - now;
      if (diff <= 0) {
        setTimeLeft('Auction ended');
        clearInterval(intervalId);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        parts.push(`${hours}h`, `${minutes}m`, `${seconds}s`);
        setTimeLeft(parts.join(' '));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [biddingEndTime]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showToast('Please log in to access it', 'error');
      navigate('/login');
    }
    if (user?.role === 'Broker') {
      showToast('Brokers cannot access the Buy Listings page.', 'error');
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`${APIRoutes.getSingleListing}/${id}`, {
          withCredentials: true,
        });
        setListing(data.listing);
        setBiddingEndTime(data.listing.biddingEndTime);
        // console.log(data.listing);
        const bidData = await axios.get(`${APIRoutes.getBids}/${id}`, {
          withCredentials: true,
        });
        if (bidData.data.bids && bidData.data.bids.length > 0) {
          setCurrentBid(bidData.data.bids[0].amount);
          setBidHistory(bidData.data.bids.map(bid => ({ user: bid.bidder.username, amount: bid.amount, userId: bid.bidder._id })));
        }
      } catch (error) {
        showToast('Failed to load property bidding details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    socket.connect();
    socket.emit('joinListing', id);

    socket.on('newBid', handleNewBid);

    return () => {
      socket.off('newBid', handleNewBid);
    };
  }, [id]);

  function handleNewBid(newBid) {
    setCurrentBid(prev => Math.max(prev, newBid.amount));
    setBidHistory(prev => [newBid, ...prev]);
    setBiddingEndTime(new Date(newBid.biddingEndTime));
  }


  const handleBidSubmit = async () => {
    try {
    const bidAmount = parseFloat(myBid);
    if (isNaN(bidAmount) || bidAmount <= currentBid) {
      alert('Bid must be a number and greater than current bid!');
      return;
    }

    // Submit the bid
    const { data } = await axios.post(`${APIRoutes.createBid}`, {
      listingId: id,
      amount: bidAmount
    }, {
      withCredentials: true
    });

    setMyBid('');
    setIsModalOpen(false);
    console.log(data);
    showToast(data.message, data.status);
    }
    catch (error) {
      console.log(error);
      console.error('Error placing bid:', error);
      showToast(error.response.data.message, error.response.data.status);
      setIsModalOpen(false);
      setMyBid('');
    }
  };

  if (loading) return <p className="text-center mt-10 text-lg text-gray-600">Loading bidding details...</p>;
  if (!listing) return <p className="text-center mt-10 text-lg text-red-600">Property Bidding not found.</p>;

  return (
    <>
      <ClientDashboardHeader />
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{listing.name}</h1>
        <p className="text-gray-500 mb-4">📍 {listing.address}, {listing.location}</p>
        <p className="text-2xl font-semibold text-blue-600 mb-6">{currentBid && `Current Highest Bid: ₹${currentBid.toLocaleString()}`}</p>
        <p className="text-2xl font-semibold text-blue-600 mb-6">{!currentBid && `No any bid placed yet`}</p>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-800">{ timeLeft && timeLeft!=="Auction ended" ? 'Countdown:' : "" }</h2>
          <p className="text-xl text-blue-600">{timeLeft}</p>
        </div>

        <div className="border rounded-lg p-5 bg-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">📋 Bidding Details</h2>
          <div className="text-gray-600 mb-4">
            <p>📅 Bidding Started Date: <strong>{new Date(listing.biddingDate).toISOString().slice(0, 10)}</strong></p>
            <p>⏰ Bidding Started Time: <strong>{listing.biddingStartTime}</strong></p>
            <p>💰 Start Price: ₹{listing.startPrice.toLocaleString()}</p>
          </div>
          {listing && user && listing.userRef !== user._id && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
            >
              Place a Bid
            </button>
          )}

          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">📜 Bid History:</h3>
            <div className="max-h-40 overflow-y-auto border rounded">
              {bidHistory.map((bid, idx) => (
                <div
                  key={idx}
                  className="flex justify-between px-4 py-2 border-b last:border-b-0 bg-white hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-700">{bid.user}</span>
                  <span className="text-gray-800">₹{bid.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-2">Place Your Bid</h2>
            <p className="text-sm text-gray-600 mb-4">{currentBid && `Current Highest Bid: ₹${currentBid.toLocaleString()}`}</p>
            <p>{!currentBid && `No any bid placed yet`}</p>
            <input
              type="number"
              placeholder="Enter bid amount"
              value={myBid}
              onChange={(e) => setMyBid(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBidSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}
