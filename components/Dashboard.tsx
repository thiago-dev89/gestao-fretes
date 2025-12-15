import React, { useMemo } from 'react';
import { FreightRecord } from '../types';
import { Card } from './ui/Card';
import { DollarSign, Truck, Package, MapPin } from 'lucide-react';

interface DashboardProps {
  records: FreightRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const stats = useMemo(() => {
    return records.reduce((acc, curr) => {
      acc.totalFreights += 1;
      acc.totalValue += curr.totalValue;
      acc.totalDeliveries += curr.deliveryCount;
      acc.byCDD[curr.cdd] += curr.totalValue;
      return acc;
    }, {
      totalFreights: 0,
      totalValue: 0,
      totalDeliveries: 0,
      byCDD: {
        'Santa Luzia': 0,
        'Contagem': 0
      }
    });
  }, [records]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Value */}
      <Card className="border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Valor Total Pago</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalValue)}</h4>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <DollarSign size={24} />
          </div>
        </div>
      </Card>

      {/* Total Deliveries */}
      <Card className="border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Entregas Realizadas</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDeliveries}</h4>
          </div>
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <Package size={24} />
          </div>
        </div>
      </Card>

      {/* CDD Santa Luzia */}
      <Card className="border-l-4 border-l-indigo-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">CDD Santa Luzia</p>
            <h4 className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(stats.byCDD['Santa Luzia'])}</h4>
            <span className="text-xs text-slate-400">Total acumulado</span>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <MapPin size={24} />
          </div>
        </div>
      </Card>

      {/* CDD Contagem */}
      <Card className="border-l-4 border-l-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">CDD Contagem</p>
            <h4 className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(stats.byCDD['Contagem'])}</h4>
            <span className="text-xs text-slate-400">Total acumulado</span>
          </div>
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <MapPin size={24} />
          </div>
        </div>
      </Card>
    </div>
  );
};