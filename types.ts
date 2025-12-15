export type CDDLocation = 'Santa Luzia' | 'Contagem';

export interface FreightRecord {
  id: string;
  driverName: string;
  licensePlate: string;
  vehicleType: string;
  route: string; // Mapa / Rota
  date: string;
  cdd: CDDLocation;
  deliveryCount: number;
  totalValue: number;
  createdAt: number;
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