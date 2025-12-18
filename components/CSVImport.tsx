import React, { useRef, useState } from 'react';
import { CDDLocation, FreightRecord } from '../types';
import { calculateFreightValue, resolveDriverName, getDriverInfoByPlate } from '../utils';
import { Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVImportProps {
  onImport: (records: Omit<FreightRecord, 'id' | 'createdAt'>[]) => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCDD, setSelectedCDD] = useState<CDDLocation>('Santa Luzia');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try { processCSV(event.target?.result as string); } 
      catch (error) { setStatus({ type: 'error', message: 'Erro ao ler o arquivo.' }); }
    };
    reader.readAsText(file);
  };

  const processCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const newRecords: Omit<FreightRecord, 'id' | 'createdAt'>[] = [];
    let successCount = 0;
    let errorCount = 0;

    const IDX_DATE = 4;
    const IDX_MAP = 6;
    const IDX_VEHICLE = 11;
    const IDX_PLATE = 12;
    const IDX_COUNT = 21;
    const IDX_CITY = 36;
    const IDX_REGION = 37;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const separator = line.split(';').length > line.split(',').length ? ';' : ',';
      const cols = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));

      if (cols.length <= IDX_COUNT) { errorCount++; continue; }

      try {
        const dateRaw = cols[IDX_DATE];
        const mapNo = cols[IDX_MAP] || '';
        const vehicleTypeRaw = cols[IDX_VEHICLE];
        const licensePlate = cols[IDX_PLATE];
        const countRaw = cols[IDX_COUNT];
        const city = cols[IDX_CITY] || '';
        const region = cols[IDX_REGION] || '';

        if (!licensePlate || !countRaw) { errorCount++; continue; }

        let dateFormatted = '';
        if (dateRaw.includes('/')) {
            const [day, month, year] = dateRaw.split('/');
            dateFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else { dateFormatted = dateRaw; }

        const count = parseInt(countRaw, 10);
        if (isNaN(count)) { errorCount++; continue; }

        // Logic for vehicle auto-correct from plate if known
        let vehicleType = vehicleTypeRaw;
        const info = getDriverInfoByPlate(licensePlate);
        if (info) vehicleType = info.vehicle;

        const totalVal = calculateFreightValue(selectedCDD, vehicleType, count, city, region);
        const driverName = resolveDriverName(licensePlate, mapNo);

        newRecords.push({
          driverName,
          licensePlate: licensePlate.toUpperCase(),
          vehicleType,
          map: mapNo.toUpperCase(),
          city: city.toUpperCase(),
          region: region.toUpperCase(),
          date: dateFormatted,
          cdd: selectedCDD,
          deliveryCount: count,
          totalValue: totalVal
        });
        successCount++;
      } catch (err) { errorCount++; }
    }

    if (newRecords.length > 0) {
      onImport(newRecords);
      setStatus({ type: 'success', message: `Importado: ${successCount} registros. Falhas: ${errorCount}.` });
    } else { setStatus({ type: 'error', message: 'Nenhum registro válido encontrado.' }); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 shadow-inner">
      <div className="flex items-center gap-2 mb-4">
        <FileUp className="text-blue-600" size={20} />
        <h3 className="font-semibold text-slate-800">Módulo de Importação Direta</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CDD Origem do Arquivo</label>
          <div className="flex gap-2">
            {['Santa Luzia', 'Contagem'].map((loc) => (
              <button key={loc} onClick={() => setSelectedCDD(loc as CDDLocation)} className={`flex-1 py-2 text-sm font-bold rounded-lg border ${selectedCDD === loc ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>{loc}</button>
            ))}
          </div>
        </div>
        <div>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer flex items-center justify-center gap-2 bg-white border-2 border-dashed border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all font-semibold uppercase text-xs">
            <Upload size={16} /> Carregar Planilha de Fretes
          </label>
        </div>
      </div>
      {status.message && (
        <div className={`mt-3 flex items-center gap-2 text-xs font-bold ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};