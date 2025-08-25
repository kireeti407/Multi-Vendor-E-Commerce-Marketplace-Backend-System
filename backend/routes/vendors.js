import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getVendors,
  getVendor,
  updateVendorProfile,
  getVendorDashboard,
  getVendorAnalytics
} from '../controllers/vendorController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for vendor store images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const subfolder = file.fieldname === 'storeLogo' ? 'logos' : 'banners';
    cb(null, path.join(path.dirname(__dirname), 'uploads', 'vendors', subfolder));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation rules
const vendorProfileValidation = [
  body('storeName').trim().notEmpty().withMessage('Store name is required'),
  body('storeDescription').optional().trim(),
  body('businessLicense').optional().trim(),
  body('taxId').optional().trim()
];

// Public routes
router.get('/', getVendors);
router.get('/:id', getVendor);

// Protected vendor routes
router.get('/dashboard/stats', authenticateToken, authorize('vendor'), getVendorDashboard);
router.get('/analytics/overview', authenticateToken, authorize('vendor'), getVendorAnalytics);

router.put('/profile', 
  authenticateToken, 
  authorize('vendor'),
  upload.fields([
    { name: 'storeLogo', maxCount: 1 },
    { name: 'storeBanner', maxCount: 1 }
  ]),
  vendorProfileValidation,
  updateVendorProfile
);

export default router;