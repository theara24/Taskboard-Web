import { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}

export const useSEOHead = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
}: SEOHeadProps) => {
  useEffect(() => {
    const defaultTitle = 'TaskBoard — Full-Stack Kanban & Agile Project Management';
    const currentTitle = title ? `${title} | TaskBoard` : defaultTitle;
    document.title = currentTitle;

    // Helper to update meta tag by name or property
    const updateMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (description) {
      updateMetaTag('meta[name="description"]', 'name', 'description', description);
      updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
      updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    if (keywords) {
      updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    }

    if (ogTitle || title) {
      const displayOgTitle = ogTitle || currentTitle;
      updateMetaTag('meta[property="og:title"]', 'property', 'og:title', displayOgTitle);
      updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', displayOgTitle);
    }

    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
      updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }

    if (ogUrl) {
      updateMetaTag('meta[property="og:url"]', 'property', 'og:url', ogUrl);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl]);
};
