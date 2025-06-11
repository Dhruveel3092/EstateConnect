import express from 'express';
import { getClientProfile, updateClientProfile, getMyDeals} from '../controllers/client.js';
const router = express.Router();

router.get('/getprofile', getClientProfile);
router.put('/updateprofile', updateClientProfile);
router.get('/get-my-deals', getMyDeals);

export default router;