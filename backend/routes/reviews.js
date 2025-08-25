import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createReview,
  getProductReviews,
  getVendorReviews,
  updateReview,
  deleteReview,
  respondToReview
} from '../controllers/reviewController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for review images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), 'uploads', 'reviews'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

// Validation rules
const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().isLength({ max: 1000 }).withMessage('Comment is required and must be less than 1000 characters'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters')
];

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/vendor/:vendorId', getVendorReviews);

// Protected customer routes
router.post('/', 
  authenticateToken, 
  upload.array('images', 5),
  reviewValidation, 
  createReview
);

router.put('/:id', authenticateToken, reviewValidation, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

// Protected vendor routes
router.post('/:id/respond', authenticateToken, authorize('vendor'), respondToReview);

export default router;