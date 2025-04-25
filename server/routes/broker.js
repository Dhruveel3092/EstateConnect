import express from 'express';
import { getBrokerProfile, updateBrokerProfile,  getAllBrokerProfile } from '../controllers/broker.js';
const router = express.Router();

router.get('/getprofile', getBrokerProfile);
router.put('/updateprofile', updateBrokerProfile);
router.get('/get-all-brokers', getAllBrokerProfile); 

export default router;