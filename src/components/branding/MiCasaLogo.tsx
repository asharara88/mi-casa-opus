import micasaLogo from '@/assets/micasa-logo.png';

// Inline SVG string for PDF documents (no external dependencies)
export const MICASA_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 50" width="280" height="50">
  <text x="0" y="32" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="300" fill="#1a1a1a" letter-spacing="4">
    MI CASA
  </text>
  <line x1="135" y1="10" x2="135" y2="40" stroke="#0ea5a5" stroke-width="1.5"/>
  <text x="145" y="26" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="400" fill="#666666">
    Property
  </text>
  <text x="145" y="40" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="400" fill="#666666">
    Solutions
  </text>
</svg>
`;

// React component version for web use
export function MiCasaLogo({ className = '', width = 180, height = 'auto', useImage = true }: { 
  className?: string; 
  width?: number | string; 
  height?: number | string;
  useImage?: boolean;
}) {
  // Image version - logo is white/light on transparent, optimized for dark backgrounds
  if (useImage) {
    return (
      <img 
        src={micasaLogo} 
        alt="MiCasa Property Solutions"
        width={width}
        height={height}
        className={`transition-all duration-200 ${className}`}
        style={{ 
          maxWidth: typeof width === 'number' ? `${width}px` : width,
          height: height === 'auto' ? 'auto' : typeof height === 'number' ? `${height}px` : height,
          filter: 'brightness(1.1)',
        }}
      />
    );
  }
  
  // SVG fallback version - theme adaptive
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 280 50" 
      width={width} 
      height={height}
      className={className}
    >
      <text 
        x="0" 
        y="32" 
        fontFamily="Inter, Arial, sans-serif" 
        fontSize="28" 
        fontWeight="300" 
        className="fill-foreground"
        letterSpacing="4"
      >
        MI CASA
      </text>
      <line x1="135" y1="10" x2="135" y2="40" className="stroke-primary" strokeWidth="1.5"/>
      <text 
        x="145" 
        y="26" 
        fontFamily="Inter, Arial, sans-serif" 
        fontSize="12" 
        fontWeight="400" 
        className="fill-muted-foreground"
      >
        Property
      </text>
      <text 
        x="145" 
        y="40" 
        fontFamily="Inter, Arial, sans-serif" 
        fontSize="12" 
        fontWeight="400" 
        className="fill-muted-foreground"
      >
        Solutions
      </text>
    </svg>
  );
}

// Company info constants for documents
export const MICASA_COMPANY_INFO = {
  legalName: 'MI CASA REALESTATE',
  tradeName: 'MI CASA Property Solutions',
  legalNameArabic: 'مي كاسا للعقارات',
  licenseNo: 'CN-3762725',
  trn: '100496681600003',
  address: 'Office 1703, Al Masaood Building, Najda Street, Abu Dhabi, UAE',
  poBox: '4805',
  phone: '+971 2 245 7987',
  mobile: '+971 50 9026971',
  email: 'contact@micasa.ae',
  website: 'www.micasa.ae',
  regulator: 'Abu Dhabi Department of Municipalities and Transport (DMT)',
  bank: {
    name: 'ADCB - Abu Dhabi Commercial Bank',
    accountNo: '11859687820001',
    iban: 'AE440030011859687820001',
  },
};
