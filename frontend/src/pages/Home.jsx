import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Shield,
  Truck,
  Headphones
} from 'lucide-react';
import productService from '../services/productService';
import vendorService from '../services/vendorService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Fetch featured products and top vendors from API
      const [productsResponse, vendorsResponse] = await Promise.all([
        productService.getProducts({ limit: 8, sortBy: 'rating.average', sortOrder: 'desc' }),
        vendorService.getVendors({ limit: 6, sortBy: 'rating.average', sortOrder: 'desc' })
      ]);

      setFeaturedProducts(productsResponse.data.products || []);
      setTopVendors(vendorsResponse.data.vendors || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setFeaturedProducts([]);
      setTopVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // const stats = [
  //   { icon: ShoppingBag, label: 'Products', value: '10,000+' },
  //   { icon: Users, label: 'Vendors', value: '500+' },
  //   { icon: Star, label: 'Happy Customers', value: '25,000+' },
  //   { icon: TrendingUp, label: 'Orders Delivered', value: '100,000+' }
  // ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your payments and data are protected with industry-standard security'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping from our trusted vendor network'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer service to help you with any questions'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Amazing Products
              <span className="block text-accent-400">From Trusted Vendors</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto animate-slide-up">
              Join thousands of customers shopping from our curated marketplace of quality vendors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/products"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover-lift inline-flex items-center justify-center"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register?role=vendor"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover-lift inline-flex items-center justify-center"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of top-rated products from trusted vendors
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="card hover-scale bg-white group"
              >
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.images?.[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating.average.toFixed(1)} ({product.rating.count})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.comparePrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.comparePrice}
                        </span>
                      )}
                        <span className="text-xl font-bold text-primary-600">
                          ₹{product.discountedPrice || product.price}
                        </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    by {product.vendor?.storeName}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Vendors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Vendors</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Shop from our highest-rated vendors who consistently deliver quality products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topVendors.map((vendor) => (
              <Link
                key={vendor._id}
                to={`/vendor/${vendor._id}`}
                className="card hover-scale bg-white group"
              >
                <div className="card-body">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {vendor.storeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {vendor.storeName}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {vendor.rating.average.toFixed(1)} ({vendor.rating.count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {vendor.storeDescription}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{vendor.totalProducts || 0} Products</span>
                    <span>{vendor.totalOrders || 0} Orders</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/vendors"
              className="btn-outline inline-flex items-center"
            >
              View All Vendors
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MarketHub?</h2>
            <p className="text-xl text-gray-600">
              Experience the best in online marketplace shopping
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Join our community of happy customers and discover amazing products today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover-lift"
            >
              Create Account
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover-lift"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;