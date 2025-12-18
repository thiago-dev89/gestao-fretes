import React, { useState, useEffect } from 'react';
import { FreightRecord } from './types';
import { Dashboard } from './components/Dashboard';
import { FreightForm } from './components/FreightForm';
import { FreightList } from './components/FreightList';
import { CSVImport } from './components/CSVImport';
import { Card } from './components/ui/Card';
import { Truck, Database, Trash2, Download } from 'lucide-react';

const STORAGE_KEY = 'cdd_freight_system_v1';

const App: React.FC = () => {
  const [records, setRecords] = useState<FreightRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecords(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, loading]);

  const handleAdd = (newRecord: Omit<FreightRecord, 'id' | 'createdAt'>) => {
    const record: FreightRecord = { ...newRecord, id: crypto.randomUUID(), createdAt: Date.now() };
    setRecords((prev) => [record, ...prev]);
  };

  const handleImport = (newRecords: Omit<FreightRecord, 'id' | 'createdAt'>[]) => {
    const recordsWithIds = newRecords.map(r => ({ ...r, id: crypto.randomUUID(), createdAt: Date.now() }));
    setRecords((prev) => [...recordsWithIds, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este frete?')) setRecords((prev) => prev.filter(r => r.id !== id));
  };

  const handleUpdateMapDate = (id: string, mapClosedDate: string | undefined) => {
    setRecords((prev) => prev.map(record => record.id === id ? { ...record, mapClosedDate } : record));
  };

  const handleClearAll = () => {
    if (records.length === 0) return;
    if (window.confirm("ATENÇÃO: Apagar todo o banco de dados?")) setRecords([]);
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Data', 'CDD', 'Mapa', 'Cidade', 'Regiao', 'Motorista', 'Veiculo', 'Placa', 'Entregas', 'Valor', 'Data Adiado'];
    const rows = records.map(r => [
      r.date, r.cdd, r.map, r.city, r.region, r.driverName, r.vehicleType, r.licensePlate, r.deliveryCount, r.totalValue.toFixed(2).replace('.', ','), r.mapClosedDate || ''
    ]);
    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_fretes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Refatorado */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-default">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-700">
              <Truck size={32} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none transition-all duration-300 group-hover:tracking-tight">
                CROSSER<span className="text-blue-600 transition-colors duration-300 group-hover:text-blue-500">LOG</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 transition-colors group-hover:text-slate-600">
                Sistema De Gestão de Fretes
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <Database size={12} className="text-emerald-500" /> Banco Local Ativo
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 space-y-8 w-full mb-12">
        <Dashboard records={records} />
        
        <Card title="Portal de Registro de Fretes" className="border-t-4 border-t-blue-600">
          <CSVImport onImport={handleImport} />
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400">
              <span className="bg-white px-4">Ou Lançamento Manual</span>
            </div>
          </div>
          <FreightForm onAdd={handleAdd} />
        </Card>

        <section>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-slate-100 p-4 rounded-xl border border-slate-200 gap-4">
            <h2 className="text-lg font-bold text-slate-700 uppercase tracking-tight">Histórico Consolidado</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wider shadow-sm">
                <Download size={14} /> Exportar
              </button>
              <button onClick={handleClearAll} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all uppercase tracking-wider shadow-sm">
                <Trash2 size={14} /> Limpar
              </button>
            </div>
          </div>
          <FreightList records={records} onDelete={handleDelete} onUpdateMapDate={handleUpdateMapDate} />
        </section>
      </main>
    </div>
  );
};

export default App;