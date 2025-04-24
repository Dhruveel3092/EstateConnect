import express from 'express';
import { getBrokerProfile, updateBrokerProfile } from '../controllers/broker.js';
const router = express.Router();

router.get('/getprofile', getBrokerProfile);
router.put('/updateprofile', updateBrokerProfile);

export default router;