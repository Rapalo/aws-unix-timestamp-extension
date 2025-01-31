const FLAG_BASE_URL = 'http://purecatamphetamine.github.io/country-flag-icons/3x2/';

export function getFlagUrl(countryCode) {
  return `${FLAG_BASE_URL}${countryCode.toUpperCase()}.svg`;
}

export function getFlagImg(countryCode) {
  return `<img 
    src="${getFlagUrl(countryCode)}" 
    alt="${countryCode} flag" 
    style="width: 16px; height: 12px; vertical-align: middle; margin-right: 4px;"
  />`;
}

// List of supported country codes
export const countries = [
  'US', 'GB', 'BR', 'FR', 'DE', 'IT', 'JP', 'CN', 'RU', 'IN',
  // Add more as needed
];

export function hasFlag(countryCode) {
  return countries.includes(countryCode.toUpperCase());
} 