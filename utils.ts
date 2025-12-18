import { CDDLocation } from './types';

interface DriverInfo {
  name: string;
  vehicle: string;
}

// Mapa de Placas para Motoristas e Veículos Fixos
const DRIVER_PLATE_MAP: Record<string, DriverInfo> = {
  // CDD CONTAGEM
  'ANF6E07': { name: 'Anacleto Celestino Simão', vehicle: 'VUC' },
  'GWH1A47': { name: 'Guilherme Spindola Reis Lobo', vehicle: 'VUC' },
  'CPI6330': { name: 'Neyber Da Rocha', vehicle: 'VUC' },
  'NFC3385': { name: 'Johnny Gil De Sousa', vehicle: 'VUC' },
  'HJU2112': { name: 'Wemerson Alves De Oliveira', vehicle: 'VUC' },
  'JQI9E36': { name: 'Jose Augusto Farias Gonzaga', vehicle: 'VUC' },
  'LNV2F26': { name: 'Altair Xavier Marques Neto', vehicle: 'VUC' },
  'HEH3651': { name: 'Alisson Jones Evangelista Corr', vehicle: 'VUC' },
  'GSV5A52': { name: 'Raoni Barbosa De Oliveira', vehicle: 'VUC' },
  'GRV6566': { name: 'Ronaldo Jose Da Silva', vehicle: 'VUC' },

  // CDD SANTA LUZIA
  'OVF5J11': { name: 'Joel Gabriel Da Silva', vehicle: 'VUC' },
  'OVF5J13': { name: 'Ricardo Alves Da Silva', vehicle: 'VUC' },
  'PWI2D86': { name: 'Thiago Estanislau Oliveira', vehicle: 'VUC' },
  'OPZ7G60': { name: 'Weslley Lucas Pinheiro', vehicle: 'VUC' },
  'GYJ2C95': { name: 'Claudio Ribeiro De Assuncao', vehicle: 'VUC' }
};

const normalizeText = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
};

export const getDriverInfoByPlate = (plate: string): DriverInfo | null => {
  const normalizedPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return DRIVER_PLATE_MAP[normalizedPlate] || null;
};

export const resolveDriverName = (plate: string, mapRef?: string): string => {
  const info = getDriverInfoByPlate(plate);
  if (info) return info.name;
  return mapRef ? `Motorista (Mapa ${mapRef})` : 'Motorista Não Identificado';
};

export const calculateFreightValue = (
  cdd: CDDLocation,
  vehicleType: string,
  count: number,
  city: string,
  region: string
): number => {
  const v = normalizeText(vehicleType);
  const locationText = normalizeText(`${city} ${region}`);

  let type = 'OTHER';
  if (/\bVUC\b|3\s*[\/\-]\s*4|\bHR\b|\bVAN\b/.test(v)) {
    type = 'VUC';
  } else if (/\bTOCO\b/.test(v)) {
    type = 'TOCO';
  } else if (/\bTRUCK\b|\bTRUCADO\b/.test(v)) {
    type = 'TRUCK';
  }

  if (cdd === 'Contagem') {
    if (/\bESMERALDAS\b/.test(locationText)) {
      if (type === 'VUC') return count <= 20 ? 810 : 900;
      if (type === 'TOCO') return count <= 15 ? 1000 : 1060;
      if (type === 'TRUCK') return count <= 10 ? 1100 : 1170;
    }
    if (type === 'VUC') return count <= 20 ? 750 : 820;
    if (type === 'TOCO') return count <= 15 ? 900 : 960;
    if (type === 'TRUCK') return count <= 10 ? 1000 : 1070;
  }

  if (cdd === 'Santa Luzia') {
    const specialRegionsRegex = /PEDRO\s+LEOPOLDO|P\.?\s*LEOPOLDO|CONFINS|MATOZINHOS|LAGOA\s+SANTA|L\.?\s*SANTA/;
    const isSpecialRegion = specialRegionsRegex.test(locationText);

    if (isSpecialRegion) {
      if (type === 'VUC') {
        if (count <= 15) return 750;
        if (count > 20) return 800;
        return 750;
      }
      if (type === 'TOCO') return count <= 15 ? 950 : 1025;
      if (type === 'TRUCK') return count <= 10 ? 1050 : 1125;
    }

    if (type === 'VUC') return count <= 20 ? 750 : 820;
    if (type === 'TOCO') return count <= 15 ? 900 : 960;
    if (type === 'TRUCK') return count <= 10 ? 1000 : 1070;
  }

  return 0;
};