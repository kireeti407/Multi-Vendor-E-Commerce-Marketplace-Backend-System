import express from 'express';
import {
  getDashboardStats,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllOrders,
  getAllReviews,
  moderateReview,
  getAnalytics
} from '../controllers/adminController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken);
router.use(authorize('admin'));

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Vendor management
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);

// Order management
router.get('/orders', getAllOrders);

// Review management
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/moderate', moderateReview);

export default router;