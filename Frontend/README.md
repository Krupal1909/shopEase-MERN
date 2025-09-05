# E-Commerce Frontend

A modern, responsive e-commerce frontend built with React.js, featuring a complete shopping experience with cart management, user authentication, payment integration, and more.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse products by categories with filtering and sorting
- **Search**: Advanced search with autocomplete suggestions
- **Product Details**: Detailed product pages with image carousels, variants, and reviews
- **Shopping Cart**: Add/remove items, quantity management, and persistent cart
- **Wishlist**: Save favorite products for later
- **User Authentication**: Login, signup, and profile management
- **Checkout Process**: Multi-step checkout with address and payment options
- **Order Management**: View order history and track orders
- **Payment Integration**: Razorpay payment gateway integration

### UI/UX Features
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Animations**: Smooth transitions and hover effects
- **Loading States**: Skeleton loaders and loading indicators
- **SEO Optimized**: Meta tags, structured data, and SEO-friendly URLs
- **Accessibility**: Focus states and keyboard navigation support

## 🛠️ Tech Stack

- **Frontend Framework**: React.js 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with React Icons
- **Carousel**: React Slick
- **Notifications**: React Hot Toast
- **Payment**: Razorpay integration
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Carousel.js          # Hero, Product, and Image carousels
│   │   ├── LazyImage.js         # Lazy loading images
│   │   ├── Loader.js            # Loading spinners and skeletons
│   │   ├── Modal.js             # Reusable modal component
│   │   ├── ProductCard.js       # Product display card
│   │   ├── ScrollToTop.js       # Scroll to top button
│   │   └── SEOHead.js           # SEO meta tags component
│   └── layout/
│       ├── Footer.js            # Site footer
│       └── Navbar.js            # Navigation header
├── context/
│   └── AppContext.js            # Global state management
├── pages/
│   ├── Cart.js                  # Shopping cart page
│   ├── CategoryPage.js          # Category listing page
│   ├── Checkout.js              # Checkout process
│   ├── Home.js                  # Homepage
│   ├── Login.js                 # User login
│   ├── NotFound.js              # 404 page
│   ├── Orders.js                # Order history
│   ├── PaymentFailure.js        # Payment failure page
│   ├── PaymentSuccess.js        # Payment success page
│   ├── ProductDetails.js        # Product detail page
│   ├── Profile.js               # User profile
│   ├── SearchResults.js         # Search results
│   ├── Signup.js                # User registration
│   └── Wishlist.js              # Wishlist page
├── services/
│   └── api.js                   # API service layer
├── utils/
│   ├── animations.js            # Animation utilities
│   └── seo.js                   # SEO utilities
├── App.js                       # Main app component
├── index.css                    # Global styles
└── index.js                     # App entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-com-mern/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API base URL
- `REACT_APP_RAZORPAY_KEY_ID`: Razorpay public key for payments

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`:
- Custom color palette
- Dark mode support
- Custom animations
- Responsive breakpoints

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Theming

### Dark Mode
- Automatic system preference detection
- Manual toggle in navigation
- Persistent user preference
- Smooth transitions between themes

### Color Scheme
- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary elements
- **Success**: Green for positive actions
- **Error**: Red for error states
- **Warning**: Yellow for warnings

## 🔐 Authentication

The app supports:
- Email/password login and registration
- JWT token-based authentication
- Persistent login sessions
- Protected routes for authenticated users
- User profile management

## 💳 Payment Integration

### Razorpay Integration
- Secure payment processing
- Multiple payment methods
- Order confirmation
- Payment success/failure handling
- Invoice generation

## 🛒 Shopping Features

### Cart Management
- Add/remove products
- Quantity adjustment
- Price calculations
- Persistent cart storage
- Guest cart support

### Wishlist
- Save favorite products
- Easy cart addition
- Persistent storage
- User-specific wishlists

## 🔍 Search & Filtering

### Search Features
- Real-time search suggestions
- Category-based filtering
- Price range filtering
- Brand filtering
- Rating-based filtering
- Sorting options (price, rating, newest)

## 📊 Performance Optimizations

- **Lazy Loading**: Images and components
- **Code Splitting**: Route-based splitting
- **Memoization**: React.memo for components
- **Debounced Search**: Reduced API calls
- **Optimized Images**: WebP support and compression
- **Skeleton Loading**: Better perceived performance

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Build Optimization
```bash
npm run build
```

### Deployment Options
- **Netlify**: Drag and drop build folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Static website hosting
- **Firebase Hosting**: Google's hosting solution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- [ ] Progressive Web App (PWA) features
- [ ] Social login integration
- [ ] Product comparison feature
- [ ] Advanced filtering options
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] Live chat support
- [ ] Product reviews and ratings system
- [ ] Inventory management integration

---

Built with ❤️ using React.js and Tailwind CSS
