import express from 'express';
import { getClientProfile, updateClientProfile, getMyDeals ,getRecentListings} from '../controllers/client.js';
const router = express.Router();

router.get('/getprofile', getClientProfile);
router.put('/updateprofile', updateClientProfile);
router.get('/get-my-deals', getMyDeals);
router.get('/recent-properties', getRecentListings);

export default router;