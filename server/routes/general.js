import express from 'express';
import { getSignature, uploadProfileImage } from '../controllers/general.js';
const router = express.Router();

router.get('/getsignature', getSignature);
router.post('/upload-profile-image', uploadProfileImage);

export default router;