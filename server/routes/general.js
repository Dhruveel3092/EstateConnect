import express from 'express';
import { getSignature, uploadProfileImage, createListing } from '../controllers/general.js';
const router = express.Router();

router.get('/getsignature', getSignature);
router.post('/upload-profile-image', uploadProfileImage);
router.post('/create-listing', createListing);

export default router;