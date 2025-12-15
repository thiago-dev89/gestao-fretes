import React, { useRef, useState } from 'react';
import { CDDLocation, FreightRecord } from '../types';
import { calculateFreightValue, resolveDriverName } from '../utils';
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
      try {
        const text = event.target?.result as string;
        processCSV(text);
      } catch (error) {
        setStatus({ type: 'error', message: 'Erro ao ler o arquivo.' });
      }
    };
    reader.readAsText(file);
  };

  const processCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const newRecords: Omit<FreightRecord, 'id' | 'createdAt'>[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Indices based on User Request (0-indexed)
    // E=4 (Date), G=6 (Map/Ref), L=11 (Vehicle), M=12 (Plate), V=21 (Count)
    // AK=36 (City), AL=37 (Region)
    const IDX_DATE = 4;
    const IDX_MAP = 6;
    const IDX_VEHICLE = 11;
    const IDX_PLATE = 12;
    const IDX_COUNT = 21;
    const IDX_CITY = 36;
    const IDX_REGION = 37;

    for (let i = 0; i < lines.length; i++) {
      if (i === 0) continue; // Skip header

      const line = lines[i].trim();
      if (!line) continue;

      const separator = line.split(';').length > line.split(',').length ? ';' : ',';
      const cols = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));

      if (cols.length <= IDX_COUNT) {
        errorCount++;
        continue;
      }

      try {
        const dateRaw = cols[IDX_DATE]; 
        const mapRef = cols[IDX_MAP] || ''; 
        const vehicleType = cols[IDX_VEHICLE];
        const licensePlate = cols[IDX_PLATE];
        const countRaw = cols[IDX_COUNT];
        
        // Extract extra location info safely
        const city = cols[IDX_CITY] || '';
        const region = cols[IDX_REGION] || '';

        // Combine Map, City, and Region for the Route field
        const fullRoute = [mapRef, city, region].filter(Boolean).join(' - ');

        if (!licensePlate || !countRaw) {
          errorCount++;
          continue;
        }

        // Parse Date - Handles per-line dates for multi-day files
        let dateFormatted = '';
        if (dateRaw.includes('/')) {
            const [day, month, year] = dateRaw.split('/');
            // Assumes DD/MM/YYYY format common in Brazil
            dateFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
            // Fallback for potentially ISO or other formats, try to respect the raw data
            // If the CSV provides dates in different formats, logic might need adjustment
            dateFormatted = dateRaw;
        }

        const count = parseInt(countRaw, 10);
        if (isNaN(count)) {
            errorCount++;
            continue;
        }

        // Calculate Value using Business Logic
        const totalVal = calculateFreightValue(selectedCDD, vehicleType, count, fullRoute);

        // Resolve Driver Name based on Fixed List or Route
        const driverName = resolveDriverName(licensePlate, mapRef);

        newRecords.push({
          driverName: driverName,
          licensePlate: licensePlate.toUpperCase(),
          vehicleType: vehicleType,
          route: fullRoute,
          date: dateFormatted,
          cdd: selectedCDD,
          deliveryCount: count,
          totalValue: totalVal
        });
        successCount++;
      } catch (err) {
        errorCount++;
      }
    }

    if (newRecords.length > 0) {
      onImport(newRecords);
      setStatus({ type: 'success', message: `Sucesso! ${successCount} registros importados. ${errorCount > 0 ? `${errorCount} linhas ignoradas.` : ''}` });
    } else {
      setStatus({ type: 'error', message: 'Nenhum registro válido encontrado no arquivo.' });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FileUp className="text-blue-600" size={20} />
        <h3 className="font-semibold text-slate-800">Importar CSV</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CDD Padrão para Importação</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCDD('Santa Luzia')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedCDD === 'Santa Luzia'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Santa Luzia
            </button>
            <button
              onClick={() => setSelectedCDD('Contagem')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedCDD === 'Contagem'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Contagem
            </button>
          </div>
        </div>

        <div>
           <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label 
            htmlFor="csv-upload"
            className="cursor-pointer flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors w-full font-medium shadow-sm"
          >
            <Upload size={18} />
            Selecionar Arquivo
          </label>
        </div>
      </div>

      {status.message && (
        <div className={`mt-3 flex items-center gap-2 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}
      
      <div className="mt-3 text-xs text-slate-400">
        <p>Colunas CSV: Data (E), Mapa (G), Veículo (L), Placa (M), Quantidade (V), Cidade (AK), Região (AL).</p>
      </div>
    </div>
  );
};