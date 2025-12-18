export type CDDLocation = 'Santa Luzia' | 'Contagem';

export interface FreightRecord {
  id: string;
  driverName: string;
  licensePlate: string;
  vehicleType: string;
  map: string;      // Novo campo: Número do Mapa
  city: string;     // Novo campo: Cidade
  region: string;   // Novo campo: Região/Bairro
  date: string;
  cdd: CDDLocation;
  deliveryCount: number;
  totalValue: number;
  createdAt: number;
  mapClosedDate?: string;
}

export interface DashboardStats {
  totalFreights: number;
  totalValue: number;
  totalDeliveries: number;
  byCDD: {
    'Santa Luzia': number;
    'Contagem': number;
  };
}