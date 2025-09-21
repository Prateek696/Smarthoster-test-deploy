
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCalendly, CalendlyConfig } from '@/hooks/useCalendly';
import { cn } from '@/lib/utils';

interface CalendlyButtonProps {
  children: React.ReactNode;
  calendlyUrl: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  prefillEmail?: string;
  prefillName?: string;
}

const CalendlyButton: React.FC<CalendlyButtonProps> = ({
  children,
  calendlyUrl,
  className,
  style,
  variant = 'default',
  size = 'default',
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  prefillEmail,
  prefillName,
}) => {
  const { openCalendlyPopup } = useCalendly();

  const handleClick = () => {
    const config: CalendlyConfig = {
      url: calendlyUrl,
      prefill: {
        email: prefillEmail,
        name: prefillName,
      },
      utm: {
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
      },
    };

    // Add CSS for Calendly widget if not already added
    if (!document.querySelector('link[href*="calendly.com"]')) {
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    openCalendlyPopup(config);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      style={style}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export default CalendlyButton;
