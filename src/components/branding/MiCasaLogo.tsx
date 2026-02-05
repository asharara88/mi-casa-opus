 import micasaLogo from '@/assets/micasa-logo.png';

// Inline SVG string for PDF documents (no external dependencies)
export const MICASA_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50" width="150" height="50">
  <!-- MI CASA Text -->
  <text x="0" y="24" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#1a1a1a">
    MI CASA
  </text>
  
  <!-- REALESTATE Text -->
  <text x="0" y="38" font-family="Arial, sans-serif" font-size="10" font-weight="500" fill="#0284C7" letter-spacing="2">
    REALESTATE
  </text>
  
  <!-- Arabic Text -->
  <text x="0" y="48" font-family="Arial, sans-serif" font-size="9" fill="#666666">
    مي كاسا
  </text>
</svg>
`;

// React component version for web use
 export function MiCasaLogo({ className = '', width = 150, height = 'auto', useImage = true }: { 
  className?: string; 
   width?: number | string; 
   height?: number | string;
   useImage?: boolean;
}) {
   // Image version with theme-adaptive styling
   if (useImage) {
     return (
       <img 
         src={micasaLogo} 
         alt="MiCasa Real Estate"
         width={width}
         height={height}
         className={`dark:invert-0 invert ${className}`}
         style={{ 
           maxWidth: typeof width === 'number' ? `${width}px` : width,
           height: height === 'auto' ? 'auto' : typeof height === 'number' ? `${height}px` : height
         }}
       />
     );
   }
   
   // SVG fallback version
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 150 50" 
      width={width} 
      height={height}
      className={className}
    >
      {/* MI CASA Text */}
      <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#1a1a1a">
        MI CASA
      </text>
      
      {/* REALESTATE Text */}
      <text x="0" y="38" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="500" fill="#0284C7" letterSpacing="2">
        REALESTATE
      </text>
      
      {/* Arabic Text */}
      <text x="0" y="48" fontFamily="Arial, sans-serif" fontSize="9" fill="#666666">
        مي كاسا
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
