import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign,
  FiPackage,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 900,
    totalUsers: 127,
    totalOrders: 245,
    revenue: 15420,
    monthlyGrowth: 12.5,
    conversionRate: 3.2,
    averageOrderValue: 62.9
  });
  const [chartData, setChartData] = useState({
    sales: [],
    revenue: [],
    categories: []
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon ${color}`}>
          <Icon size={20} />
        </div>
        {change && (
          <div className="stat-change">
            <FiTrendingUp size={14} />
            {change}
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Track your store's performance and growth metrics</p>
      </div>

      <div className="time-range-selector">
        {['7d', '30d', '90d', '1y'].map((range) => (
          <button
            key={range}
            className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' ? 'Last 7 days' : 
             range === '30d' ? 'Last 30 days' : 
             range === '90d' ? 'Last 90 days' : 'Last year'}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`$${stats.revenue?.toLocaleString() || 0}`}
          change="+23.1%"
          color="green"
        />
        <StatCard
          icon={FiShoppingCart}
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || 0}
          change="+15.3%"
          color="blue"
        />
        <StatCard
          icon={FiUsers}
          title="Total Customers"
          value={stats.totalUsers?.toLocaleString() || 0}
          change="+8.2%"
          color="purple"
        />
        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={stats.totalProducts?.toLocaleString() || 0}
          change="+5.1%"
          color="yellow"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-icon">
              <FiBarChart2 size={20} />
            </div>
            <h3 className="chart-title">Sales Overview</h3>
          </div>
          <div className="chart-placeholder">
            Chart will be rendered here - Sales data for {timeRange}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-icon">
              <FiPieChart size={20} />
            </div>
            <h3 className="chart-title">Category Distribution</h3>
          </div>
          <div className="chart-placeholder">
            Chart will be rendered here - Category breakdown
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-icon">
              <FiTrendingUp size={20} />
            </div>
            <h3 className="chart-title">Revenue Trends</h3>
          </div>
          <div className="chart-placeholder">
            Chart will be rendered here - Revenue trends over time
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <div className="action-btn">
            <div className="action-icon">
              <FiPackage size={16} />
            </div>
            <span>Manage Products</span>
          </div>
          <div className="action-btn">
            <div className="action-icon">
              <FiShoppingCart size={16} />
            </div>
            <span>View Orders</span>
          </div>
          <div className="action-btn">
            <div className="action-icon">
              <FiUsers size={16} />
            </div>
            <span>Customer Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
