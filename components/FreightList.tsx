import React, { useState, useMemo } from 'react';
import { FreightRecord } from '../types';
import { Trash2, Search, Filter, Calendar } from 'lucide-react';

interface FreightListProps {
  records: FreightRecord[];
  onDelete: (id: string) => void;
}

type DateFilterType = 'all' | 'week' | 'last-month' | 'custom';

// Helper for fast string date generation (YYYY-MM-DD) avoiding timezone issues of toISOString
const toLocalISOString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const FreightList: React.FC<FreightListProps> = ({ records, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCDD, setFilterCDD] = useState<string>('all');
  
  // Date Filter States
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 1. Calculate Date Ranges outside the loop (Memoized)
  const dateRange = useMemo(() => {
    if (dateFilter === 'all') return null;
    if (dateFilter === 'custom') {
      return { start: customStartDate, end: customEndDate };
    }

    const now = new Date();
    // Reset time to avoid issues, working with local dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'week') {
      const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
      
      const start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
      
      const end = new Date(today);
      end.setDate(today.getDate() + (6 - dayOfWeek)); // Go forward to Saturday
      
      return { start: toLocalISOString(start), end: toLocalISOString(end) };
    }

    if (dateFilter === 'last-month') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
      
      return { start: toLocalISOString(start), end: toLocalISOString(end) };
    }

    return null;
  }, [dateFilter, customStartDate, customEndDate]);

  // 2. Filter and Sort (Memoized)
  // Using String comparison for dates is significantly faster than new Date() inside loops
  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return records.filter(record => {
      // Text Search
      if (term && 
          !record.driverName.toLowerCase().includes(term) && 
          !record.licensePlate.toLowerCase().includes(term)) {
        return false;
      }

      // CDD Filter
      if (filterCDD !== 'all' && record.cdd !== filterCDD) {
        return false;
      }

      // Date Filter (String Comparison is fast and accurate for YYYY-MM-DD)
      if (dateRange && record.date) {
        if (dateRange.start && record.date < dateRange.start) return false;
        if (dateRange.end && record.date > dateRange.end) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date descending (String comparison works for ISO dates)
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      // Secondary sort by creation time if dates are equal
      return b.createdAt - a.createdAt;
    });
  }, [records, searchTerm, filterCDD, dateRange]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border border-slate-200">
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar motorista ou placa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* CDD Select */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={filterCDD}
                  onChange={(e) => setFilterCDD(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white w-full sm:w-auto"
                >
                  <option value="all">Todos os CDDs</option>
                  <option value="Santa Luzia">Santa Luzia</option>
                  <option value="Contagem">Contagem</option>
                </select>
              </div>
            </div>

            {/* Date Filter Type Select */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                  className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white w-full sm:w-auto"
                >
                  <option value="all">Todas as Datas</option>
                  <option value="week">Esta Semana</option>
                  <option value="last-month">Mês Anterior</option>
                  <option value="custom">Intervalo Personalizado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Date Range Inputs (Conditional) */}
        {dateFilter === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-sm font-medium text-slate-600">Intervalo:</span>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm w-full sm:w-auto"
              />
              <span className="text-slate-400">até</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm w-full sm:w-auto"
              />
            </div>
          </div>
        )}

      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full bg-white text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">CDD</th>
              <th className="px-6 py-4">Rota/Mapa</th>
              <th className="px-6 py-4">Motorista</th>
              <th className="px-6 py-4">Veículo</th>
              <th className="px-6 py-4">Placa</th>
              <th className="px-6 py-4 text-center">Entregas</th>
              <th className="px-6 py-4 text-right">Valor Calculado</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(record.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.cdd === 'Santa Luzia' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {record.cdd}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs uppercase">{record.route || '-'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{record.driverName}</td>
                  <td className="px-6 py-4">{record.vehicleType || '-'}</td>
                  <td className="px-6 py-4 font-mono">{record.licensePlate}</td>
                  <td className="px-6 py-4 text-center">{record.deliveryCount}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(record.totalValue)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(record.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};