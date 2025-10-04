import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withBorder?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
  inheritPadding?: boolean;
}

const paddingMap = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

const radiusMap = {
  xs: '0.25rem',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
};

export function Card({ 
  children, 
  padding = 'lg', 
  radius = 'md', 
  className = '',
  'data-testid': dataTestId
}: CardProps) {
  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: radiusMap[radius],
    padding: paddingMap[padding],
  };

  return (
    <div 
      style={cardStyles}
      className={className}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

export function CardSection({ 
  children, 
  className = '',
  inheritPadding = false
}: CardSectionProps) {
  const sectionStyles = {
    margin: '0 -1.5rem', // Negative margin to extend to card edges
    paddingLeft: inheritPadding ? '1.5rem' : '0',
    paddingRight: inheritPadding ? '1.5rem' : '0',
  };

  return (
    <div 
      style={sectionStyles}
      className={className}
    >
      {children}
    </div>
  );
}

// Attach Section as a property of Card for compound component pattern
Card.Section = CardSection;
