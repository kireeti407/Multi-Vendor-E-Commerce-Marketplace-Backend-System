import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  getCategories
} from '../controllers/productController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), 'uploads', 'products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('inventory.quantity').isNumeric().isInt({ min: 0 }).withMessage('Valid quantity is required')
];

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Protected vendor routes
router.post('/', 
  authenticateToken, 
  authorize('vendor'), 
  upload.array('images', 10),
  productValidation, 
  createProduct
);

router.put('/:id', 
  authenticateToken, 
  authorize('vendor'), 
  upload.array('images', 10),
  productValidation, 
  updateProduct
);

router.delete('/:id', authenticateToken, authorize('vendor'), deleteProduct);
router.get('/vendor/my-products', authenticateToken, authorize('vendor'), getVendorProducts);

export default router;