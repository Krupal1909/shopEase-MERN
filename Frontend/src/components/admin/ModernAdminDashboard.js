import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign,
  FiEye,
  FiStar,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiTarget,
  FiBarChart2,
  FiShoppingCart,
  FiPackage,
  FiCreditCard
} from 'react-icons/fi';
import './ModernAdminDashboard.css';

const ModernAdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalProducts: 900,
    totalUsers: 127,
    totalOrders: 43,
    revenue: 125000,
    monthlyGrowth: 12.5,
    conversionRate: 3.2,
    avgOrderValue: 2906,
    recentOrders: [],
    topProducts: []
  });

  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setAnalytics({
        ...analytics,
        recentOrders: [
          { id: '#72c7ea38', customer: 'Krupal Patel', amount: 2500, date: '2025-01-08', status: 'completed' },
          { id: '#83d8fb49', customer: 'Rahul Sharma', amount: 1800, date: '2025-01-07', status: 'pending' },
          { id: '#94e9gc50', customer: 'Priya Singh', amount: 3200, date: '2025-01-07', status: 'completed' },
          { id: '#a5f0hd61', customer: 'Amit Kumar', amount: 1500, date: '2025-01-06', status: 'shipped' }
        ],
        topProducts: [
          { name: 'Apple iPhone 14 Pro Max', price: 89999, reviews: 45, rating: 4.8, sales: 23 },
          { name: 'Samsung Galaxy Watch', price: 25000, reviews: 32, rating: 4.6, sales: 18 },
          { name: 'Sony WH-1000XM5', price: 29999, reviews: 28, rating: 4.9, sales: 15 },
          { name: 'MacBook Pro 14-inch', price: 199999, reviews: 12, rating: 4.7, sales: 8 }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'shipped': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
          <Icon size={24} />
        </div>
        <div className={`stat-trend ${trend === 'up' ? 'positive' : 'negative'}`}>
          {trend === 'up' ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
          {trendValue}%
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="modern-admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.revenue)}
          icon={FiDollarSign}
          trend="up"
          trendValue={analytics.monthlyGrowth}
          color="#10B981"
        />
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders.toLocaleString()}
          icon={FiShoppingCart}
          trend="up"
          trendValue="8.2"
          color="#3B82F6"
        />
        <StatCard
          title="Total Products"
          value={analytics.totalProducts.toLocaleString()}
          icon={FiPackage}
          trend="up"
          trendValue="15.3"
          color="#8B5CF6"
        />
        <StatCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          icon={FiUsers}
          trend="up"
          trendValue="12.5"
          color="#F59E0B"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="orders-list">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <span className="order-id">{order.id}</span>
                  <span className="customer-name">{order.customer}</span>
                </div>
                <div className="order-details">
                  <span className="order-amount">{formatCurrency(order.amount)}</span>
                  <span 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card top-products">
          <div className="card-header">
            <h3>Top Products</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="products-list">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-meta">
                    <span className="product-price">{formatCurrency(product.price)}</span>
                    <div className="product-rating">
                      <FiStar size={14} />
                      {product.rating}
                    </div>
                  </div>
                </div>
                <div className="product-sales">
                  <span className="sales-count">{product.sales} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card analytics-chart">
          <div className="card-header">
            <h3>Sales Analytics</h3>
            <div className="chart-controls">
              <button className="chart-btn active">Revenue</button>
              <button className="chart-btn">Orders</button>
              <button className="chart-btn">Users</button>
            </div>
          </div>
          <div className="chart-placeholder">
            <FiBarChart2 size={48} />
            <p>Interactive charts will be displayed here</p>
          </div>
        </div>

        <div className="dashboard-card quick-stats">
          <div className="card-header">
            <h3>Quick Stats</h3>
          </div>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <FiTarget size={20} />
              <div>
                <span className="stat-number">{analytics.conversionRate}%</span>
                <span className="stat-label">Conversion Rate</span>
              </div>
            </div>
            <div className="quick-stat">
              <FiCreditCard size={20} />
              <div>
                <span className="stat-number">{formatCurrency(analytics.avgOrderValue)}</span>
                <span className="stat-label">Avg Order Value</span>
              </div>
            </div>
            <div className="quick-stat">
              <FiActivity size={20} />
              <div>
                <span className="stat-number">94.2%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
            </div>
            <div className="quick-stat">
              <FiEye size={20} />
              <div>
                <span className="stat-number">2.4K</span>
                <span className="stat-label">Page Views Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminDashboard;
