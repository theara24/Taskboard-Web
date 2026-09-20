import React from 'react';
import { useSEOHead, SEOHeadProps } from '../../hooks/useSEOHead';

export const SEOHead: React.FC<SEOHeadProps> = (props) => {
  useSEOHead(props);
  return null;
};

export default SEOHead;
