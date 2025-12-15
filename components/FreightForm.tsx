import React, { useState, useEffect } from 'react';
import { CDDLocation, FreightRecord } from '../types';
import { calculateFreightValue } from '../utils';
import { PlusCircle } from 'lucide-react';

interface FreightFormProps {
  onAdd: (record: Omit<FreightRecord, 'id' | 'createdAt'>) => void;
}

export const FreightForm: React.FC<FreightFormProps> = ({ onAdd }) => {
  const [driverName, setDriverName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('VUC');
  const [route, setRoute] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cdd, setCdd] = useState<CDDLocation>('Santa Luzia');
  const [deliveryCount, setDeliveryCount] = useState<string>('');
  
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Auto-calculate total whenever relevant fields change
  useEffect(() => {
    const count = parseInt(deliveryCount || '0', 10);
    const total = calculateFreightValue(cdd, vehicleType, count, route);
    setEstimatedTotal(total);
  }, [cdd, vehicleType, deliveryCount, route]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverName || !licensePlate || !deliveryCount || !vehicleType) return;

    const count = parseInt(deliveryCount, 10);
    const total = calculateFreightValue(cdd, vehicleType, count, route);

    onAdd({
      driverName,
      licensePlate: licensePlate.toUpperCase(),
      vehicleType,
      route: route.toUpperCase(),
      date,
      cdd,
      deliveryCount: count,
      totalValue: total
    });

    // Reset form fields
    setDriverName('');
    setLicensePlate('');
    setRoute('');
    setDeliveryCount('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      
      {/* Date */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* CDD Selection Buttons */}
      <div className="lg:col-span-3 flex flex-col">
        <label className="block text-sm font-medium text-slate-700 mb-1">CDD Destino</label>
        <div className="flex gap-2 h-full">
          <button
            type="button"
            onClick={() => setCdd('Santa Luzia')}
            className={`flex-1 px-2 py-2 text-sm font-medium rounded-lg border transition-colors ${
              cdd === 'Santa Luzia'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Santa Luzia
          </button>
          <button
            type="button"
            onClick={() => setCdd('Contagem')}
            className={`flex-1 px-2 py-2 text-sm font-medium rounded-lg border transition-colors ${
              cdd === 'Contagem'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Contagem
          </button>
        </div>
      </div>

      {/* Driver Name */}
      <div className="lg:col-span-3">
        <label className="block text-sm font-medium text-slate-700 mb-1">Motorista</label>
        <input
          type="text"
          required
          placeholder="Nome completo"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* License Plate */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
        <input
          type="text"
          required
          placeholder="ABC-1234"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
        />
      </div>

      {/* Vehicle Type */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        >
          <option value="VUC">VUC</option>
          <option value="TOCO">Toco</option>
          <option value="TRUCK">Truck</option>
        </select>
      </div>

      {/* Route / Map */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Rota / Mapa</label>
        <input
          type="text"
          placeholder="Ex: Confins, Mapa 5"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Delivery Count */}
      <div className="lg:col-span-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">Qtd.</label>
        <input
          type="number"
          min="1"
          required
          placeholder="0"
          value={deliveryCount}
          onChange={(e) => setDeliveryCount(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Footer / Total */}
      <div className="lg:col-span-12 flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
        <div className="text-sm text-slate-600">
          Total Calculado: <span className="font-bold text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedTotal)}</span>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <PlusCircle size={18} />
          Registrar Frete
        </button>
      </div>
    </form>
  );
};