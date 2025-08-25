import { validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';

// Get all products with pagination and filtering
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      vendor
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .populate('vendor', 'storeName rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

// Get single product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'storeName storeDescription rating user')
      .populate({
        path: 'vendor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

// Create new product (Vendor only)
export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get vendor profile
    console.log(req.user)
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || !vendor.isApproved) {
      return res.status(403).json({ 
        message: 'Vendor profile not found or not approved' 
      });
    }

    const productData = {
      ...req.body,
      vendor: vendor._id
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    const product = await Product.create(productData);
    
    await product.populate('vendor', 'storeName rating');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// Update product (Vendor only)
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get vendor profile
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ message: 'Vendor profile not found' });
    }

    const product = await Product.findOne({ 
      _id: req.params.id, 
      vendor: vendor._id 
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found or access denied' 
      });
    }

    const updateData = { ...req.body };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendor', 'storeName rating');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// Delete product (Vendor only)
export const deleteProduct = async (req, res) => {
  try {
    // Get vendor profile
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ message: 'Vendor profile not found' });
    }

    const product = await Product.findOne({ 
      _id: req.params.id, 
      vendor: vendor._id 
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found or access denied' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

// Get vendor's products
export const getVendorProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Get vendor profile
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ message: 'Vendor profile not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = { vendor: vendor._id };
    
    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Server error while fetching vendor products' });
  }
};

// Get product categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};