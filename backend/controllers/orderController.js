import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, paymentMethod, shippingAddress, billingAddress, notes } = req.body;

    // Validate and calculate order totals
    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product)
        .populate('vendor', 'commissionRate');

      if (!product || !product.isActive) {
        return res.status(400).json({ 
          message: `Product not found or inactive: ${item.product}` 
        });
      }

      // Check inventory
      if (product.inventory.trackQuantity && 
          product.inventory.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}` 
        });
      }

      const itemTotal = product.discountedPrice * item.quantity;
      
      orderItems.push({
        product: product._id,
        vendor: product.vendor._id,
        quantity: item.quantity,
        price: product.discountedPrice,
        total: itemTotal
      });

      totalAmount += itemTotal;

      // Update product inventory
      if (product.inventory.trackQuantity) {
        product.inventory.quantity -= item.quantity;
        product.totalSales += item.quantity;
        await product.save();
      }
    }

    // Calculate shipping and tax (simplified)
    const shippingCost = totalAmount > 100 ? 0 : 10;
    const tax = totalAmount * 0.08; // 8% tax
    const grandTotal = totalAmount + shippingCost + tax;

    // Create order (use new Order() and save() to trigger pre-save hook for orderNumber)
    const order = new Order({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingCost,
      tax,
      grandTotal,
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid'
    });
    await order.save();

    // Update vendor statistics
    for (const item of orderItems) {
      await Vendor.findByIdAndUpdate(item.vendor, {
        $inc: { 
          totalOrders: 1,
          totalSales: item.total
        }
      });
    }

    // Populate order for response
    await order.populate([
      {
        path: 'customer',
        select: 'name email'
      },
      {
        path: 'items.product',
        select: 'name images price'
      },
      {
        path: 'items.vendor',
        select: 'storeName'
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// Get customer orders
export const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = { customer: req.user.id };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(filter)
      .populate([
        {
          path: 'items.product',
          select: 'name images price'
        },
        {
          path: 'items.vendor',
          select: 'storeName'
        }
      ])
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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    let order;
    // Allow admin to fetch any order
    if (req.user.role === 'admin') {
      order = await Order.findById(req.params.id)
        .populate([
          { path: 'customer', select: 'name email phone' },
          { path: 'items.product', select: 'name images price sku' },
          { path: 'items.vendor', select: 'storeName storeDescription' }
        ]);
    } else {
      order = await Order.findOne({
        _id: req.params.id,
        $or: [
          { customer: req.user.id },
          { 'items.vendor': { $in: await getVendorIds(req.user.id) } }
        ]
      })
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'items.product', select: 'name images price sku' },
        { path: 'items.vendor', select: 'storeName storeDescription' }
      ]);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

// Update order status (Vendor only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier, trackingUrl, notes } = req.body;
    
    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ message: 'Vendor profile not found' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      'items.vendor': vendor._id
    });

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or access denied' 
      });
    }

    // Update order
    const updateData = { status };
    
    if (trackingNumber) {
      updateData.tracking = {
        trackingNumber,
        carrier: carrier || '',
        trackingUrl: trackingUrl || ''
      };
    }
    
    if (notes) updateData.notes = notes;
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      {
        path: 'customer',
        select: 'name email'
      },
      {
        path: 'items.product',
        select: 'name images'
      }
    ]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
};

// Get vendor orders
export const getVendorOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(403).json({ message: 'Vendor profile not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = { 'items.vendor': vendor._id };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(filter)
      .populate([
        {
          path: 'customer',
          select: 'name email phone'
        },
        {
          path: 'items.product',
          select: 'name images price sku'
        }
      ])
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
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error while fetching vendor orders' });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or cannot be cancelled' 
      });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackQuantity) {
        product.inventory.quantity += item.quantity;
        product.totalSales -= item.quantity;
        await product.save();
      }

      // Update vendor stats
      await Vendor.findByIdAndUpdate(item.vendor, {
        $inc: { 
          totalOrders: -1,
          totalSales: -item.total
        }
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.refundReason = reason;
    
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
};

// Helper function to get vendor IDs for a user
async function getVendorIds(userId) {
  const vendor = await Vendor.findOne({ user: userId });
  return vendor ? [vendor._id] : [];
}