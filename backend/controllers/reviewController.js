import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';

// Create new review
export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product, rating, title, comment, order } = req.body;

    // Verify the customer purchased this product
    const customerOrder = await Order.findOne({
      _id: order,
      customer: req.user.id,
      'items.product': product,
      status: 'delivered'
    });

    if (!customerOrder) {
      return res.status(400).json({ 
        message: 'You can only review products you have purchased and received' 
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      customer: req.user.id,
      product: product
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      });
    }

    // Get product and vendor
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviewData = {
      customer: req.user.id,
      product,
      vendor: productDoc.vendor,
      order,
      rating,
      title,
      comment,
      isVerifiedPurchase: true
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      reviewData.images = req.files.map(file => file.path);
    }

    const review = await Review.create(reviewData);

    // Update product rating
    await updateProductRating(product);
    
    // Update vendor rating
    await updateVendorRating(productDoc.vendor);

    await review.populate([
      {
        path: 'customer',
        select: 'name avatar'
      },
      {
        path: 'product',
        select: 'name images'
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
};

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      rating
    } = req.query;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Build filter
    const filter = { 
      product: req.params.productId,
      isApproved: true
    };
    if (rating) filter.rating = parseInt(rating);
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find(filter)
      .populate('customer', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      {
        $match: { 
          product: new mongoose.Types.ObjectId(req.params.productId),
          isApproved: true
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        ratingStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReviews: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching product reviews' });
  }
};

// Get vendor reviews
export const getVendorReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = { 
      vendor: req.params.vendorId,
      isApproved: true
    };

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find(filter)
      .populate('customer', 'name avatar')
      .populate('product', 'name images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReviews: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching vendor reviews' });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found or access denied' 
      });
    }

    const oldRating = review.rating;

    review.rating = rating;
    review.title = title;
    review.comment = comment;
    
    await review.save();

    // Update product rating if rating changed
    if (oldRating !== rating) {
      await updateProductRating(review.product);
      await updateVendorRating(review.vendor);
    }

    await review.populate([
      {
        path: 'customer',
        select: 'name avatar'
      },
      {
        path: 'product',
        select: 'name images'
      }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found or access denied' 
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update product and vendor ratings
    await updateProductRating(review.product);
    await updateVendorRating(review.vendor);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
};

// Vendor respond to review
export const respondToReview = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Response message is required' });
    }

    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ message: 'Vendor profile not found' });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      vendor: vendor._id
    });

    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found or access denied' 
      });
    }

    review.vendorResponse = {
      message: message.trim(),
      respondedAt: new Date()
    };

    await review.save();

    await review.populate([
      {
        path: 'customer',
        select: 'name avatar'
      },
      {
        path: 'product',
        select: 'name images'
      }
    ]);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ message: 'Server error while responding to review' });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    {
      $match: { 
        product: productId,
        isApproved: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const rating = stats.length > 0 ? {
    average: Math.round(stats[0].averageRating * 10) / 10,
    count: stats[0].totalReviews
  } : { average: 0, count: 0 };

  await Product.findByIdAndUpdate(productId, { rating });
}

// Helper function to update vendor rating
async function updateVendorRating(vendorId) {
  const stats = await Review.aggregate([
    {
      $match: { 
        vendor: vendorId,
        isApproved: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const rating = stats.length > 0 ? {
    average: Math.round(stats[0].averageRating * 10) / 10,
    count: stats[0].totalReviews
  } : { average: 0, count: 0 };

  await Vendor.findByIdAndUpdate(vendorId, { rating });
}