import React, { useState, useMemo } from 'react';
import { FreightRecord } from '../types';
import { Trash2, Search, Filter, Calendar, Clock, X } from 'lucide-react';

interface FreightListProps {
  records: FreightRecord[];
  onDelete: (id: string) => void;
  onUpdateMapDate: (id: string, date: string | undefined) => void;
}

type DateFilterType = 'all' | 'week' | 'last-month' | 'custom';

const toLocalISOString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FreightList: React.FC<FreightListProps> = ({ records, onDelete, onUpdateMapDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCDD, setFilterCDD] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [tempMapDate, setTempMapDate] = useState('');

  const dateRange = useMemo(() => {
    if (dateFilter === 'all') return null;
    if (dateFilter === 'custom') return { start: customStartDate, end: customEndDate };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'week') {
      const dayOfWeek = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek);
      const end = new Date(today);
      end.setDate(today.getDate() + (6 - dayOfWeek));
      return { start: toLocalISOString(start), end: toLocalISOString(end) };
    }
    if (dateFilter === 'last-month') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: toLocalISOString(start), end: toLocalISOString(end) };
    }
    return null;
  }, [dateFilter, customStartDate, customEndDate]);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return records.filter(record => {
      if (term && 
          !record.driverName.toLowerCase().includes(term) && 
          !record.licensePlate.toLowerCase().includes(term) &&
          !record.map.toLowerCase().includes(term) &&
          !record.city.toLowerCase().includes(term)) {
        return false;
      }
      if (filterCDD !== 'all' && record.cdd !== filterCDD) return false;
      if (dateRange && record.date) {
        if (dateRange.start && record.date < dateRange.start) return false;
        if (dateRange.end && record.date > dateRange.end) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [records, searchTerm, filterCDD, dateRange]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const openMapDateModal = (record: FreightRecord) => {
    setEditingMapId(record.id);
    setTempMapDate(record.mapClosedDate || '');
  };

  const saveMapDate = () => {
    if (editingMapId) {
      onUpdateMapDate(editingMapId, tempMapDate || undefined);
      setEditingMapId(null);
      setTempMapDate('');
    }
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {editingMapId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Adiar Pagamento</h3>
              <button onClick={() => setEditingMapId(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">Informe a data do fechamento do mapa para adiar o pagamento.</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fechamento Mapa</label>
              <input type="date" value={tempMapDate} onChange={(e) => setTempMapDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setTempMapDate(''); setTimeout(saveMapDate, 0); }} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">Remover</button>
              <button onClick={saveMapDate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por placa, motorista, mapa ou cidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <select value={filterCDD} onChange={(e) => setFilterCDD(e.target.value)} className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="all">Todos os CDDs</option>
                <option value="Santa Luzia">Santa Luzia</option>
                <option value="Contagem">Contagem</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilterType)} className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="all">Todas as Datas</option>
                <option value="week">Esta Semana</option>
                <option value="last-month">Mês Anterior</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
        </div>
        {dateFilter === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2 border-t border-slate-100">
            <span className="text-sm font-medium text-slate-600">Intervalo:</span>
            <div className="flex gap-2 items-center">
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
              <span className="text-slate-400">até</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-4">Data</th>
              <th className="px-4 py-4">CDD</th>
              <th className="px-4 py-4">Mapa</th>
              <th className="px-4 py-4">Cidade</th>
              <th className="px-4 py-4">Região</th>
              <th className="px-4 py-4">Motorista</th>
              <th className="px-4 py-4">Placa</th>
              <th className="px-4 py-4 text-center">Entregas</th>
              <th className="px-4 py-4 text-right">Valor</th>
              <th className="px-4 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const isDelayed = !!record.mapClosedDate;
                return (
                  <tr key={record.id} className={`hover:bg-slate-50 transition-colors ${isDelayed ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{formatDate(record.date)}</span>
                        {isDelayed && (
                          <div className="flex items-center gap-1 text-amber-600 font-medium text-[10px] mt-1 bg-amber-100 px-1.5 py-0.5 rounded w-fit uppercase">
                            <Clock size={10} />
                            <span>Adiado: {formatDate(record.mapClosedDate!)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${record.cdd === 'Santa Luzia' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                        {record.cdd}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{record.map || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-900 font-medium">{record.city || '-'}</td>
                    <td className="px-4 py-4 text-xs italic">{record.region || '-'}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{record.driverName}</td>
                    <td className="px-4 py-4 font-mono">{record.licensePlate}</td>
                    <td className="px-4 py-4 text-center font-bold">{record.deliveryCount}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">{formatCurrency(record.totalValue)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openMapDateModal(record)} className={`p-1.5 rounded-md ${isDelayed ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'}`} title="Adiar"><Clock size={16} /></button>
                        <button onClick={() => onDelete(record.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};