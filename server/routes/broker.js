import express from 'express';
import { getBrokerProfile, updateBrokerProfile,  getAllBrokerProfile, getBrokerListings ,getBrokerListingDetails, updateBrokerRemarks} from '../controllers/broker.js';
const router = express.Router();

router.get('/getprofile', getBrokerProfile);
router.put('/updateprofile', updateBrokerProfile);
router.get('/get-all-brokers', getAllBrokerProfile); 
router.get('/get-broker-listings', getBrokerListings); 
router.get('/get-broker-listing-details/:id', getBrokerListingDetails); 
router.put('/update-remarks/:id', updateBrokerRemarks); 
export default router;