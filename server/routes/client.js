import express from 'express';
import { getClientProfile, updateClientProfile } from '../controllers/client.js';
const router = express.Router();

router.get('/getprofile', getClientProfile);
router.put('/updateprofile', updateClientProfile);

export default router;