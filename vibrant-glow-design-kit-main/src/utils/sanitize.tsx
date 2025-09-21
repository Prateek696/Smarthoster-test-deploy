import React from 'react';
import DOMPurify from 'dompurify';

export const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });
};

interface SafeHTMLProps {
  content: string;
  className?: string;
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ content, className }) => {
  const sanitizedContent = sanitizeHTML(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};