import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  storeDescription: {
    type: String,
    trim: true
  },
  businessLicense: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String
  },
  storeSettings: {
    returnPolicy: {
      type: String,
      default: '30 days return policy'
    },
    shippingPolicy: {
      type: String,
      default: 'Ships within 3-5 business days'
    },
    processingTime: {
      type: Number,
      default: 2 // days
    }
  },
  commissionRate: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 50
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  storeLogo: {
    type: String,
    default: ''
  },
  storeBanner: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Vendor', vendorSchema);