import { useEffect } from 'react';
import { updatePageTitle, updateMetaDescription, updateMetaKeywords, updateOpenGraphMeta, addStructuredData, removeStructuredData } from '../../utils/seo';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  structuredData 
}) => {
  useEffect(() => {
    // Update page title
    if (title) {
      updatePageTitle(title);
    }

    // Update meta description
    if (description) {
      updateMetaDescription(description);
    }

    // Update meta keywords
    if (keywords) {
      updateMetaKeywords(keywords);
    }

    // Update Open Graph meta tags
    if (title && description) {
      updateOpenGraphMeta(
        title,
        description,
        image || '/logo192.png',
        url || window.location.href
      );
    }

    // Add structured data
    if (structuredData) {
      removeStructuredData(); // Remove existing structured data
      addStructuredData(structuredData);
    }

    // Cleanup function
    return () => {
      if (structuredData) {
        removeStructuredData();
      }
    };
  }, [title, description, keywords, image, url, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;
