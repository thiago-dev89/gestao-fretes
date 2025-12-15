import { CDDLocation } from './types';

// Mapa de Placas para Motoristas Fixos (Normalizado sem hífens)
const DRIVER_PLATE_MAP: Record<string, string> = {
  // CDD CONTAGEM
  'ANF6E07': 'Anacleto Celestino Simão',
  'GWH1A47': 'Guilherme Spindola Reis Lobo',
  'CPI6330': 'Neyber Da Rocha',
  'NFC3385': 'Johnny Gil De Sousa',
  'HJU2112': 'Wemerson Alves De Oliveira',
  'JQI9E36': 'Jose Augusto Farias Gonzaga',
  'LNV2F26': 'Altair Xavier Marques Neto',
  'HEH3651': 'Alisson Jones Evangelista Corr',
  'GSV5A52': 'Raoni Barbosa De Oliveira',
  'GRV6566': 'Ronaldo Jose Da Silva',

  // CDD SANTA LUZIA
  'OVF5J11': 'Joel Gabriel Da Silva',
  'OVF5J13': 'Ricardo Alves Da Silva',
  'PWI2D86': 'Thiago Estanislau Oliveira',
  'OPZ7G60': 'Weslley Lucas Pinheiro',
  'GYJ2C95': 'Claudio Ribeiro De Assuncao'
};

// Helper to normalize strings (remove accents, uppercase, clean spaces)
const normalizeText = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, " ") // Normalize whitespace
    .toUpperCase()
    .trim();
};

export const resolveDriverName = (plate: string, routeRef?: string): string => {
  // Remove caracteres especiais e deixa maiúsculo para comparação (ex: ABC-1234 vira ABC1234)
  const normalizedPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  const fixedName = DRIVER_PLATE_MAP[normalizedPlate];
  
  if (fixedName) {
    return fixedName;
  }
  
  return routeRef ? `Motorista (Rota ${routeRef})` : 'Motorista Não Identificado';
};

export const calculateFreightValue = (
  cdd: CDDLocation,
  vehicleType: string,
  count: number,
  route: string
): number => {
  const v = normalizeText(vehicleType);
  const r = normalizeText(route);

  // Normalize Vehicle Type using flexible Regex
  let type = 'OTHER';
  
  // VUC: Matches "VUC", "3/4", "3 / 4", "3-4", "HR", "VAN"
  if (/\bVUC\b|3\s*[\/\-]\s*4|\bHR\b|\bVAN\b/.test(v)) {
    type = 'VUC';
  } 
  // TOCO: Matches "TOCO", "CAMINHAO TOCO"
  else if (/\bTOCO\b/.test(v)) {
    type = 'TOCO';
  } 
  // TRUCK: Matches "TRUCK", "TRUCADO"
  else if (/\bTRUCK\b|\bTRUCADO\b/.test(v)) {
    type = 'TRUCK';
  }

  if (cdd === 'Contagem') {
    // Check for Esmeraldas Region
    // Regex matches "ESMERALDAS" ensuring it's not part of another word if boundaries exist
    if (/\bESMERALDAS\b/.test(r)) {
      if (type === 'VUC') return count <= 20 ? 810 : 900;
      if (type === 'TOCO') return count <= 15 ? 1000 : 1060;
      if (type === 'TRUCK') return count <= 10 ? 1100 : 1170;
    }

    // Standard Contagem
    if (type === 'VUC') return count <= 20 ? 750 : 820;
    if (type === 'TOCO') return count <= 15 ? 900 : 960;
    if (type === 'TRUCK') return count <= 10 ? 1000 : 1070;
  }

  if (cdd === 'Santa Luzia') {
    // Check for Special Regions using flexible Regex
    // Supports:
    // "PEDRO LEOPOLDO" or "P. LEOPOLDO" or "P LEOPOLDO"
    // "LAGOA SANTA" or "L. SANTA"
    // "CONFINS"
    // "MATOZINHOS"
    const specialRegionsRegex = /PEDRO\s+LEOPOLDO|P\.?\s*LEOPOLDO|CONFINS|MATOZINHOS|LAGOA\s+SANTA|L\.?\s*SANTA/;
    const isSpecialRegion = specialRegionsRegex.test(r);

    if (isSpecialRegion) {
      if (type === 'VUC') {
        if (count <= 15) return 750;
        if (count > 20) return 800;
        return 750; // Gap 16-20 fallback
      }
      if (type === 'TOCO') return count <= 15 ? 950 : 1025;
      if (type === 'TRUCK') return count <= 10 ? 1050 : 1125;
    }

    // Standard Santa Luzia
    if (type === 'VUC') return count <= 20 ? 750 : 820;
    if (type === 'TOCO') return count <= 15 ? 900 : 960;
    if (type === 'TRUCK') return count <= 10 ? 1000 : 1070;
  }

  return 0; // Default or Unknown
};