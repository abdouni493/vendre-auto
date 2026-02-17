
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface ReportsProps { lang: Language; }

export const Reports: React.FC<ReportsProps> = ({ lang }) => {
  const t = translations[lang];
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Data Fetching within range
      const [salesRes, purchasesRes, expensesRes, transRes, maintRes] = await Promise.all([
        supabase.from('sales').select('*').gte('created_at', startDate).lte('created_at', `${endDate}T23:59:59`),
        supabase.from('purchases').select('*'),
        supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate),
        supabase.from('worker_transactions').select('*').gte('created_at', startDate).lte('created_at', `${endDate}T23:59:59`),
        supabase.from('inspections').select('*').gte('created_at', startDate).lte('created_at', `${endDate}T23:59:59`) // Placeholder for maintenance costing if needed
      ]);

      const sales = salesRes.data || [];
      const purchases = purchasesRes.data || [];
      const expenses = expensesRes.data || [];
      const transactions = transRes.data || [];

      // Logic: Gross Earnings from Sales
      let revenue = 0;
      let grossGain = 0;
      let totalDebt = 0;
      
      sales.forEach(s => {
        revenue += Number(s.total_price);
        totalDebt += Number(s.balance);
        const original = purchases.find(p => p.id === s.car_id);
        if (original) {
          grossGain += (Number(s.total_price) - Number(original.totalCost));
        }
      });

      // Logic: Operational Costs
      const shopExpensesTotal = expenses.reduce((acc, curr) => acc + Number(curr.cost), 0);
      const salariesPaid = transactions.filter(tr => tr.type === 'paiement').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const advancesGiven = transactions.filter(tr => tr.type === 'avance').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const penaltyDeductions = transactions.filter(tr => tr.type === 'absence').reduce((acc, curr) => acc + Number(curr.amount), 0);

      // Inventory valuation
      const activeStock = purchases.filter(p => !p.is_sold);
      const stockValuation = activeStock.reduce((acc, curr) => acc + Number(curr.sellingPrice), 0);
      const stockInvestment = activeStock.reduce((acc, curr) => acc + Number(curr.totalCost), 0);

      setReport({
        revenue,
        grossGain,
        totalDebt,
        shopExpenses: shopExpensesTotal,
        salaries: salariesPaid,
        advances: advancesGiven,
        penalties: penaltyDeductions,
        netProfit: grossGain - shopExpensesTotal - salariesPaid,
        soldCount: sales.length,
        stockCount: activeStock.length,
        stockValuation,
        stockInvestment,
        inspectionCount: (salesRes.data?.length || 0) + (maintRes.data?.length || 0)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-8 items-end justify-between bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.reports.start}</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[2rem] outline-none focus:border-blue-500 font-bold text-slate-800 transition-all shadow-inner" />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.reports.end}</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-6 py-5 rounded-[2rem] outline-none focus:border-blue-500 font-bold text-slate-800 transition-all shadow-inner" />
          </div>
        </div>
        <button 
          onClick={generateReport} 
          disabled={loading}
          className="custom-gradient-btn px-16 py-6 rounded-[2.5rem] text-white font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Calcul...' : '📊 Générer Analyse'}
        </button>
      </div>

      {report && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-12">
          
          {/* Key Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Chiffre d'Affaires" value={report.revenue} unit="DA" icon="📈" color="blue" />
            <StatCard label="Bénéfice Net Période" value={report.netProfit} unit="DA" icon="💰" color="green" highlight />
            <StatCard label="Unités Vendues" value={report.soldCount} unit="Auto" icon="🛒" color="purple" />
            <StatCard label="Créances Clients" value={report.totalDebt} unit="DA" icon="⌛" color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Financial Breakdown */}
            <div className="bg-white rounded-[4rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden">
              <h3 className="text-2xl font-black text-slate-900 mb-10 border-b border-slate-50 pb-6">Ventilation des Charges</h3>
              <div className="space-y-8">
                <ReportRow label="Achats Véhicules (Investis)" value={report.stockInvestment} unit="DA" />
                <ReportRow label="Salaires Net Versés" value={report.salaries} unit="DA" danger />
                <ReportRow label="Avances sur Salaire" value={report.advances} unit="DA" danger />
                <ReportRow label="Pénalités/Retenues" value={report.penalties} unit="DA" highlight />
                <ReportRow label="Frais de Structure (Boutique)" value={report.shopExpenses} unit="DA" danger />
                <div className="pt-8 border-t border-slate-50 mt-4 flex justify-between items-center">
                   <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Total Charges Fixes</span>
                   <span className="text-2xl font-black text-red-600">{(report.shopExpenses + report.salaries + report.advances).toLocaleString()} DA</span>
                </div>
              </div>
            </div>

            {/* Inventory Valuation */}
            <div className="bg-slate-900 text-white rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
               <h3 className="text-2xl font-black mb-10 border-b border-white/5 pb-6 text-blue-400">Bilan Actif Showroom</h3>
               <div className="space-y-8">
                  <ReportRow label="Véhicules Actuellement en Stock" value={report.stockCount} unit="Unités" inverse />
                  <ReportRow label="Valeur Marchande du Stock" value={report.stockValuation} unit="DA" inverse highlight />
                  <ReportRow label="Total Investissement Immobile" value={report.stockInvestment} unit="DA" inverse />
                  <ReportRow label="Dossiers d'Inspections" value={report.inspectionCount} unit="Rapports" inverse />
                  
                  <div className="pt-8 border-t border-white/5 mt-4 text-center">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4">Prévisionnel</p>
                     <p className="text-4xl font-black text-white tracking-tighter">{(report.stockValuation - report.stockInvestment).toLocaleString()} <span className="text-lg text-blue-400">DA</span></p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Plus-value latente sur stock</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Detailed Print Export Section */}
          <div className="bg-slate-50 p-12 rounded-[4rem] text-center border-2 border-dashed border-slate-200">
             <h4 className="text-xl font-black text-slate-800 mb-4">Exportation Rapport Complet</h4>
             <p className="text-slate-500 font-medium mb-8 max-w-lg mx-auto text-sm leading-relaxed">Ce rapport contient l'intégralité des flux financiers et opérationnels du {startDate} au {endDate}. Format prêt pour impression comptable.</p>
             <button onClick={() => window.print()} className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95">Imprimer Dossier Périodique 🖨️</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color, highlight, unit }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border-2 ${highlight ? 'border-green-400' : 'border-slate-50'} shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group`}>
      <div className={`h-16 w-16 rounded-2xl ${colors[color]} border flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-black tracking-tighter ${highlight ? 'text-green-600' : 'text-slate-900'}`}>{value.toLocaleString()} <span className="text-xs opacity-30">{unit}</span></p>
    </div>
  );
};

const ReportRow = ({ label, value, unit, highlight, danger, inverse }: any) => (
  <div className={`flex justify-between items-center py-5 border-b ${inverse ? 'border-white/5' : 'border-slate-50'}`}>
    <span className={`${inverse ? 'text-slate-400' : 'text-slate-500'} font-bold tracking-tight text-sm`}>{label}</span>
    <span className={`text-lg font-black ${danger ? 'text-red-500' : (highlight ? 'text-green-600' : (inverse ? 'text-white' : 'text-slate-900'))} tracking-tighter`}>
      {value.toLocaleString()} <span className="text-[10px] font-bold opacity-30 tracking-normal ml-1">{unit}</span>
    </span>
  </div>
);
