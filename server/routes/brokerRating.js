import express from 'express';
import { rateBroker, getRating } from '../controllers/brokerRating.js';

const router = express.Router();
router.post('/rate-property/:propertyId',  rateBroker);
router.get('/get-rating/:propertyId', getRating);

export default router;
