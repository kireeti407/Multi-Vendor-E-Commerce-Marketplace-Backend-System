import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get current month and year
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalVendors = await Vendor.countDocuments();
    const approvedVendors = await Vendor.countDocuments({ isApproved: true });
    const pendingVendors = await Vendor.countDocuments({ isApproved: false });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });

    // Orders statistics
    const totalOrders = await Order.countDocuments();
    const thisMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Revenue statistics
    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' }
        }
      }
    ]);

    const thisMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandTotal' }
        }
      }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandTotal' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    const thisMonthRev = thisMonthRevenue.length > 0 ? thisMonthRevenue[0].revenue : 0;
    const lastMonthRev = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].revenue : 0;

    // Recent activities
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentVendors = await Vendor.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentReviews = await Review.find()
      .populate('customer', 'name')
      .populate('product', 'name')
      .populate('vendor', 'storeName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Order status breakdown
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top categories
    const topCategories = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          approvedVendors,
          pendingVendors,
          totalProducts,
          activeProducts,
          totalOrders,
          totalRevenue
        },
        growth: {
          orderGrowth: lastMonthOrders > 0 ? 
            ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 
            thisMonthOrders > 0 ? 100 : 0,
          revenueGrowth: lastMonthRev > 0 ? 
            ((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : 
            thisMonthRev > 0 ? 100 : 0
        },
        recentActivities: {
          recentOrders,
          recentVendors,
          recentReviews
        },
        statistics: {
          orderStatusStats,
          topCategories
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};

// Get all vendors with filtering
export const getAllVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { storeDescription: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'pending') {
      filter.isApproved = false;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const vendors = await Vendor.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

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
    console.error('Get all vendors error:', error);
    res.status(500).json({ message: 'Server error while fetching vendors' });
  }
};

// Approve vendor
export const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      success: true,
      message: 'Vendor approved successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error while approving vendor' });
  }
};

// Reject vendor
export const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: false,
        rejectionReason: reason 
      },
      { new: true }
    ).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      success: true,
      message: 'Vendor status updated successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ message: 'Server error while updating vendor status' });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    
    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.vendor', 'storeName')
      .populate('items.product', 'name images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOrders: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    
    if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'pending') {
      filter.isApproved = false;
    }
    
    if (rating) filter.rating = parseInt(rating);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reviews = await Review.find(filter)
      .populate('customer', 'name email')
      .populate('product', 'name images')
      .populate('vendor', 'storeName')
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
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// Moderate review (approve/reject)
export const moderateReview = async (req, res) => {
  try {
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use approve or reject.' });
    }

    const updateData = {
      isApproved: action === 'approve'
    };

    if (action === 'reject' && reason) {
      updateData.moderationReason = reason;
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('customer', 'name email')
    .populate('product', 'name')
    .populate('vendor', 'storeName');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update product and vendor ratings if approved
    if (action === 'approve') {
      await updateProductRating(review.product._id);
      await updateVendorRating(review.vendor._id);
    }

    res.json({
      success: true,
      message: `Review ${action}d successfully`,
      data: { review }
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ message: 'Server error while moderating review' });
  }
};

// Get platform analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
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

    // Revenue over time
    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // User growth
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Top performing vendors
    const topVendors = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.vendor',
          totalRevenue: { $sum: '$items.total' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $project: {
          storeName: '$vendor.storeName',
          totalRevenue: 1,
          totalOrders: 1
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        revenueData,
        userGrowthData,
        topVendors
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

// Helper functions (same as in reviewController)
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