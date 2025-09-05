// Animation utility functions
export const fadeIn = (element, duration = 300) => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 10);
};

export const slideIn = (element, direction = 'left', duration = 300) => {
  const translateValue = direction === 'left' ? '-100%' : direction === 'right' ? '100%' : '0, -100%';
  element.style.transform = `translate(${translateValue})`;
  element.style.transition = `transform ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.transform = 'translate(0, 0)';
  }, 10);
};

export const bounce = (element, duration = 600) => {
  element.style.animation = `bounce ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

export const pulse = (element, duration = 1000) => {
  element.style.animation = `pulse ${duration}ms ease infinite`;
};

export const shake = (element, duration = 500) => {
  element.style.animation = `shake ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

export const glow = (element, duration = 2000) => {
  element.style.animation = `glow ${duration}ms ease infinite`;
};

export const stopAnimation = (element) => {
  element.style.animation = '';
};

// Intersection Observer for scroll animations
export const observeElementsForAnimation = (selector, animationClass = 'animate-fadeIn') => {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(element => {
    observer.observe(element);
  });
  
  return observer;
};

// Stagger animation for multiple elements
export const staggerAnimation = (elements, animationClass, delay = 100) => {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass);
    }, index * delay);
  });
};

// Loading animation helpers
export const showLoadingAnimation = (element) => {
  element.classList.add('animate-pulse');
};

export const hideLoadingAnimation = (element) => {
  element.classList.remove('animate-pulse');
};

// Smooth scroll to element
export const smoothScrollTo = (element, offset = 0) => {
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
};

// Page transition animations
export const pageTransitionIn = (element) => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(30px)';
  element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 50);
};

export const pageTransitionOut = (element, callback) => {
  element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  element.style.opacity = '0';
  element.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    if (callback) callback();
  }, 300);
};
