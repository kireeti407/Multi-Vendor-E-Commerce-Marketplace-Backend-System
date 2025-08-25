import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getVendorOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('paymentMethod').isIn(['card', 'paypal', 'bank_transfer', 'cash_on_delivery']).withMessage('Valid payment method is required'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Shipping phone is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Shipping street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Shipping zip code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Shipping country is required')
];

// Customer routes
router.post('/', authenticateToken, orderValidation, createOrder);
router.get('/my-orders', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrder);
router.put('/:id/cancel', authenticateToken, cancelOrder);

// Vendor routes
router.get('/vendor/orders', authenticateToken, authorize('vendor'), getVendorOrders);
router.put('/:id/status', authenticateToken, authorize('vendor'), updateOrderStatus);

export default router;