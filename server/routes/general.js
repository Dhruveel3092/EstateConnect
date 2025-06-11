import express from 'express';
import { getSignature, uploadProfileImage, createListing,getAllListings,getSingleListing, getBids, createBid } from '../controllers/general.js';
const router = express.Router();

router.get('/getsignature', getSignature);
router.post('/upload-profile-image', uploadProfileImage);
router.post('/create-listing', createListing);
router.get('/get-all-listings',getAllListings);
router.get('/get-single-listing/:id',getSingleListing);
router.get('/get-bids/:id', getBids);
router.post('/create-bid', createBid);

export default router;