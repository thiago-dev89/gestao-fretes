import React, { useState, useEffect } from 'react';
import { CDDLocation, FreightRecord } from '../types';
import { calculateFreightValue, getDriverInfoByPlate } from '../utils';
import { PlusCircle } from 'lucide-react';

interface FreightFormProps {
  onAdd: (record: Omit<FreightRecord, 'id' | 'createdAt'>) => void;
}

export const FreightForm: React.FC<FreightFormProps> = ({ onAdd }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cdd, setCdd] = useState<CDDLocation>('Santa Luzia');
  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState('VUC');
  
  const [map, setMap] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [deliveryCount, setDeliveryCount] = useState<string>('');
  
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Auto-fill logic when plate changes
  useEffect(() => {
    const cleanPlate = licensePlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleanPlate.length >= 7) {
      const info = getDriverInfoByPlate(cleanPlate);
      if (info) {
        setDriverName(info.name);
        setVehicleType(info.vehicle);
      }
    }
  }, [licensePlate]);

  // Auto-calculate total
  useEffect(() => {
    const count = parseInt(deliveryCount || '0', 10);
    const total = calculateFreightValue(cdd, vehicleType, count, city, region);
    setEstimatedTotal(total);
  }, [cdd, vehicleType, deliveryCount, city, region]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !licensePlate || !deliveryCount) return;

    const count = parseInt(deliveryCount, 10);
    const total = calculateFreightValue(cdd, vehicleType, count, city, region);

    onAdd({
      driverName,
      licensePlate: licensePlate.toUpperCase(),
      vehicleType,
      map: map.toUpperCase(),
      city: city.toUpperCase(),
      region: region.toUpperCase(),
      date,
      cdd,
      deliveryCount: count,
      totalValue: total
    });

    setLicensePlate('');
    setDriverName('');
    setMap('');
    setCity('');
    setRegion('');
    setDeliveryCount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Row 1: Header Info */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">CDD Destino</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCdd('Santa Luzia')}
              className={`flex-1 px-2 py-2 text-sm font-medium rounded-lg border transition-colors ${
                cdd === 'Santa Luzia' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              Santa Luzia
            </button>
            <button
              type="button"
              onClick={() => setCdd('Contagem')}
              className={`flex-1 px-2 py-2 text-sm font-medium rounded-lg border transition-colors ${
                cdd === 'Contagem' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              Contagem
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
          <input
            type="text"
            required
            placeholder="ABC1234"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase text-sm"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Motorista</label>
          <input
            type="text"
            required
            placeholder="Preenchimento automático"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="VUC">VUC</option>
            <option value="TOCO">Toco</option>
            <option value="TRUCK">Truck</option>
          </select>
        </div>

        {/* Row 2: Location Info */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nº Mapa</label>
          <input
            type="text"
            placeholder="0000"
            value={map}
            onChange={(e) => setMap(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
          <input
            type="text"
            placeholder="Ex: Confins"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="lg:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Região / Bairro</label>
          <input
            type="text"
            placeholder="Ex: Industrial"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Entregas</label>
          <input
            type="number"
            min="1"
            required
            placeholder="0"
            value={deliveryCount}
            onChange={(e) => setDeliveryCount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="text-sm text-slate-600">
          Total Calculado: <span className="font-bold text-slate-900 text-lg ml-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedTotal)}</span>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          <PlusCircle size={18} />
          Registrar Frete
        </button>
      </div>
    </form>
  );
};