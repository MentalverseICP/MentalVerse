/**
 * MentalVerse Color Palette
 * Base Color: #18E614 (Vibrant Green)
 * 
 * Color Shading System for consistent, balanced UI design
 */

export const colorPalette = {
  // Primary Green - Main accent color
  primary: {
    bright: "#18E614",      // Primary bright - main buttons, highlights
    light: "#7FF54A",       // Light backgrounds, subtle accents  
    lighter: "#B3FF8C",     // Very light backgrounds
    medium: "#12B80E",      // Mid-tone secondary elements
    dark: "#0D6B08",        // Dark accents, borders
    darker: "#085604",      // Darkest shade for strong contrast
  },

  // Opacity Variants - For layering and transparency effects
  opacity: {
    minimal: "rgba(24, 230, 20, 0.05)",    // 5% - Barely visible
    subtle: "rgba(24, 230, 20, 0.10)",    // 10% - Subtle hover
    light: "rgba(24, 230, 20, 0.20)",     // 20% - Component BG
    medium: "rgba(24, 230, 20, 0.30)",    // 30% - Medium BG
    semi: "rgba(24, 230, 20, 0.50)",      // 50% - Overlays
    strong: "rgba(24, 230, 20, 0.75)",    // 75% - Strong BG
  },

  // Tailwind-like naming for quick reference
  tailwind: {
    "50": "#F0FFE5",        // Lightest
    "100": "#E8FFD1",
    "200": "#D1FFB3",
    "300": "#B3FF8C",
    "400": "#7FF54A",
    "500": "#18E614",       // Primary
    "600": "#12B80E",
    "700": "#0D8A0A",
    "800": "#0D6B08",
    "900": "#085604",       // Darkest
  },

  // Use cases - Ready-to-use color assignments
  useCases: {
    // Buttons & CTAs
    buttonPrimary: "#18E614",           // Main action buttons
    buttonSecondary: "#12B80E",         // Secondary buttons
    buttonHover: "#0D8A0A",             // Hover state
    
    // Backgrounds & Cards
    cardBackground: "rgba(24, 230, 20, 0.05)",    // Card BG
    hoverBackground: "rgba(24, 230, 20, 0.10)",   // Hover state
    activeBackground: "rgba(24, 230, 20, 0.20)",  // Active state
    
    // Badges & Labels
    badgeBright: "#18E614",
    badgeMedium: "#12B80E",
    badgeLight: "#7FF54A",
    
    // Gradients - Left to Right
    gradientPrimary: "from-[#18E614] to-[#12B80E]",
    gradientSubtle: "from-[#18E614]/30 to-[#12B80E]/20",
    gradientLight: "from-[#18E614]/20 to-[#7FF54A]/10",
    
    // Text Colors
    textPrimary: "#18E614",
    textSecondary: "#12B80E",
    textLight: "#7FF54A",
    textDark: "#0D6B08",
    
    // Shadows
    shadowColor: "#18E614",
    shadowOpacity30: "rgba(24, 230, 20, 0.30)",
    shadowOpacity40: "rgba(24, 230, 20, 0.40)",
  },
};

/**
 * Utility function to apply color based on component type
 */
export function getColorByComponent(type: 'button' | 'badge' | 'background' | 'text' | 'border'): string {
  const colors = {
    button: colorPalette.primary.bright,
    badge: colorPalette.primary.medium,
    background: colorPalette.useCases.cardBackground,
    text: colorPalette.primary.bright,
    border: colorPalette.primary.bright,
  };
  return colors[type] || colorPalette.primary.bright;
}

/**
 * Get gradient based on intensity
 */
export function getGradientByIntensity(intensity: 'high' | 'medium' | 'low'): string {
  const gradients = {
    high: "from-[#18E614] to-[#12B80E]",
    medium: "from-[#18E614]/30 to-[#12B80E]/20",
    low: "from-[#18E614]/20 to-[#7FF54A]/10",
  };
  return `bg-gradient-to-r ${gradients[intensity]}`;
}

export default colorPalette;
