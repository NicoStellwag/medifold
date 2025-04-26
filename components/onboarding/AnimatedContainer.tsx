
import React from 'react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedContainer = ({ children, className = '' }: AnimatedContainerProps) => {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
};
