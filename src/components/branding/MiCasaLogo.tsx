import { useTheme } from 'next-themes';
import micasaLogoDark from '@/assets/micasa-logo.png';
import micasaLogoLight from '@/assets/micasa-logo-light.png';

// Navy blue color for light theme
const NAVY_BLUE = '#1a365d';
const GOLD_ACCENT = '#d4a574';

// Inline SVG string for PDF documents (no external dependencies)
export const MICASA_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 50" width="280" height="50">
  <text x="0" y="32" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${NAVY_BLUE}" letter-spacing="2">
    MI CASA
  </text>
  <line x1="135" y1="10" x2="135" y2="40" stroke="${GOLD_ACCENT}" stroke-width="1.5"/>
  <text x="145" y="26" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="400" fill="#4a5568">
    Property
  </text>
  <text x="145" y="40" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="400" fill="#4a5568">
    Solutions
  </text>
</svg>
`;

// React component version for web use
export function MiCasaLogo({ className = '', width = 180, height = 'auto', useImage = false }: { 
  className?: string; 
  width?: number | string; 
  height?: number | string;
  useImage?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Image version - use theme-appropriate logo
  if (useImage) {
    const logoSrc = isDark ? micasaLogoDark : micasaLogoLight;
    
    return (
      <img 
        src={logoSrc} 
        alt="MiCasa Property Solutions"
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : 40}
        className={`transition-all duration-200 ${className}`}
        style={{ 
          maxWidth: typeof width === 'number' ? `${width}px` : width,
          height: height === 'auto' ? 'auto' : typeof height === 'number' ? `${height}px` : height,
        }}
      />
    );
  }
  
  // SVG version - theme adaptive with navy blue for light mode, white for dark mode
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 280 50" 
      width={width} 
      height={height}
      className={className}
    >
      {/* MI CASA text - navy blue in light mode, white in dark mode */}
      <text 
        x="0" 
        y="32" 
        fontFamily="Inter, Arial, sans-serif" 
        fontSize="28" 
        fontWeight="600" 
        className="fill-[#1a365d] dark:fill-white"
        letterSpacing="2"
      >
        MI CASA
      </text>
      {/* Gold accent divider */}
      <line x1="135" y1="10" x2="135" y2="40" stroke="#d4a574" strokeWidth="1.5"/>
      {/* Property Solutions text */}
      <text 
        x="145" 
        y="26" 
        fontFamily="Inter, Arial, sans-serif" 
        fontSize="12" 
        fontWeight="400" 
        className="fill-[#4a5568] dark:fill-gray-300"
      >
        Property
      </text>
      <text 
        x="145" 
        y="40" 
        fontFamily="Inter, Arial, sans-serif" 
        fontSize="12" 
        fontWeight="400" 
        className="fill-[#4a5568] dark:fill-gray-300"
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
