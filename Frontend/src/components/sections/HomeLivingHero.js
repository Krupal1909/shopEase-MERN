import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiHome, FiStar } from 'react-icons/fi';
import '../../styles/HomeLiving.css';

const HomeLivingHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Home & Living",
      subtitle: "Transform your space with our collection",
      description: "Discover beautiful furniture, decor, and essentials that make your house a home",
      primaryButton: "Shop Home",
      secondaryButton: "Decor Ideas",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
      gradient: "from-blue-600 via-blue-700 to-indigo-800"
    },
    {
      id: 2,
      title: "Modern Furniture",
      subtitle: "Stylish & Comfortable Living",
      description: "Contemporary designs that blend functionality with aesthetic appeal",
      primaryButton: "Shop Furniture",
      secondaryButton: "View Collection",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center",
      gradient: "from-indigo-600 via-purple-700 to-blue-800"
    },
    {
      id: 3,
      title: "Home Decor",
      subtitle: "Add personality to every room",
      description: "Unique pieces and accessories to express your personal style",
      primaryButton: "Shop Decor",
      secondaryButton: "Get Inspired",
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop&crop=center",
      gradient: "from-purple-600 via-indigo-700 to-blue-800"
    }
  ];

  const features = [
    { icon: FiHome, text: "Premium Quality" },
    { icon: FiStar, text: "Curated Collection" },
    { icon: FiHome, text: "Fast Delivery" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[600px] lg:min-h-[700px] py-12">
          
          {/* Left Content */}
          <div className="lg:w-1/2 text-white space-y-6 lg:pr-12">
            {/* Category Badge */}
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
              <FiHome className="text-white" size={16} />
              <span className="text-sm font-medium">All Categories</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {currentSlideData.title}
              </h1>
              <p className="text-xl lg:text-2xl font-light opacity-90">
                {currentSlideData.subtitle}
              </p>
              <p className="text-lg opacity-80 max-w-lg">
                {currentSlideData.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
              <Link
                to="/category/home"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
              >
                {currentSlideData.primaryButton}
              </Link>
              <Link
                to="/category/home?featured=true"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 text-center"
              >
                {currentSlideData.secondaryButton}
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-white opacity-90">
                  <feature.icon size={20} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
                <FiHome className="text-blue-600" size={24} />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-pulse">
                <FiStar className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition-all duration-300 z-20"
      >
        <FiArrowLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition-all duration-300 z-20"
      >
        <FiArrowRight size={20} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-white bg-opacity-5 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </section>
  );
};

export default HomeLivingHero;
