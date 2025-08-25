import { validationResult } from 'express-validator';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

// Get all vendors
export const getVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = { isApproved: true };
    
    if (search) {
      filter.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { storeDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const vendors = await Vendor.find(filter)
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-bankDetails -taxId -businessLicense');

    const total = await Vendor.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalVendors: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error while fetching vendors' });
  }
};

// Get single vendor
export const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email')
      .select('-bankDetails -taxId -businessLicense');

    if (!vendor || !vendor.isApproved) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor's products
    const products = await Product.find({ 
      vendor: vendor._id, 
      isActive: true 
    }).limit(12);

    res.json({
      success: true,
      data: { 
        vendor,
        products
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error while fetching vendor' });
  }
};

// Update vendor profile
export const updateVendorProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const updateData = { ...req.body };

    // Handle uploaded files
    if (req.files) {
      if (req.files.storeLogo) {
        updateData.storeLogo = req.files.storeLogo[0].path;
      }
      if (req.files.storeBanner) {
        updateData.storeBanner = req.files.storeBanner[0].path;
      }
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendor._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: { vendor: updatedVendor }
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error while updating vendor profile' });
  }
};

// Get vendor dashboard statistics
export const getVendorDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Get current month and year
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Count total products
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });
    const activeProducts = await Product.countDocuments({ 
      vendor: vendor._id, 
      isActive: true 
    });

    // Count orders and calculate revenue
    const totalOrders = await Order.countDocuments({
      'items.vendor': vendor._id,
      status: { $ne: 'cancelled' }
    });

    const thisMonthOrders = await Order.countDocuments({
      'items.vendor': vendor._id,
      status: { $ne: 'cancelled' },
      createdAt: { $gte: startOfMonth }
    });

    const lastMonthOrders = await Order.countDocuments({
      'items.vendor': vendor._id,
      status: { $ne: 'cancelled' },
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Calculate revenue
    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          'items.vendor': vendor._id,
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendor._id
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.total' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Get recent orders
    const recentOrders = await Order.find({
      'items.vendor': vendor._id
    })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);


    // Get low stock products using aggregation to compare two fields
    const lowStockProducts =  await Product.aggregate([
      { $match: {
          vendor: vendor._id,
          isActive: true,
          'inventory.trackQuantity': true
        }
      },
      { $addFields: {
          lowStock: { $lte: [ "$inventory.quantity", "$inventory.lowStockThreshold" ] }
        }
      },
      { $match: { lowStock: true } },
      { $limit: 10 }
    ]);

    // Get recent reviews
    const recentReviews = await Review.find({
      vendor: vendor._id
    })
    .populate('customer', 'name')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalOrders,
          totalRevenue,
          thisMonthOrders,
          lastMonthOrders,
          orderGrowth: lastMonthOrders > 0 ? 
            ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 
            thisMonthOrders > 0 ? 100 : 0,
          averageRating: vendor.rating.average,
          totalReviews: vendor.rating.count
        },
        recentOrders,
        lowStockProducts,
        recentReviews
      }
    });
  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};

// Get vendor analytics
export const getVendorAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Sales over time
    const salesData = await Order.aggregate([
      {
        $match: {
          'items.vendor': vendor._id,
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendor._id
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          sales: { $sum: '$items.total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          'items.vendor': vendor._id,
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendor._id
        }
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productName: '$product.name',
          productImage: { $arrayElemAt: ['$product.images', 0] },
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        salesData,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics data' });
  }
};