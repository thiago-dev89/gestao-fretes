import React, { useState, useEffect } from 'react';
import { FreightRecord } from './types';
import { Dashboard } from './components/Dashboard';
import { FreightForm } from './components/FreightForm';
import { FreightList } from './components/FreightList';
import { CSVImport } from './components/CSVImport';
import { Card } from './components/ui/Card';
import { Truck, Database } from 'lucide-react';

const STORAGE_KEY = 'cdd_freight_system_v1';

const App: React.FC = () => {
  const [records, setRecords] = useState<FreightRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to local storage whenever records change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [records, loading]);

  const handleAdd = (newRecord: Omit<FreightRecord, 'id' | 'createdAt'>) => {
    const record: FreightRecord = {
      ...newRecord,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setRecords((prev) => [record, ...prev]);
  };

  const handleImport = (newRecords: Omit<FreightRecord, 'id' | 'createdAt'>[]) => {
    const recordsWithIds = newRecords.map(r => ({
      ...r,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }));
    setRecords((prev) => [...recordsWithIds, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setRecords((prev) => prev.filter(r => r.id !== id));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500">Carregando sistema...</div>;
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Truck size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-slate-800 leading-tight tracking-tight">
                Crooser<span className="text-blue-600">log</span>
              </h1>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">Sistema De Gestão de Fretes</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Database size={16} />
            <span className="hidden sm:inline">Dados salvos localmente</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dashboard Section */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Visão Geral</h2>
          <Dashboard records={records} />
        </section>

        {/* Input Section */}
        <section>
           <Card title="Novo Registro de Frete" className="mb-8">
             <CSVImport onImport={handleImport} />
             <div className="border-t border-slate-100 my-6"></div>
             <h4 className="text-md font-medium text-slate-700 mb-4">Registro Manual</h4>
             <FreightForm onAdd={handleAdd} />
           </Card>
        </section>

        {/* List Section */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Histórico de Entregas</h2>
          <FreightList records={records} onDelete={handleDelete} />
        </section>

      </main>
    </div>
  );
};

export default App;