
import React, { useState, useEffect } from 'react';
import { Expense, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface ExpensesProps {
  lang: Language;
}

export const Expenses: React.FC<ExpensesProps> = ({ lang }) => {
  const t = translations[lang];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) console.error(error);
    else setExpenses(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.suppliers.confirmDelete)) {
      await supabase.from('expenses').delete().eq('id', id);
      fetchExpenses();
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingExpense) {
      await supabase.from('expenses').update(data).eq('id', editingExpense.id);
    } else {
      await supabase.from('expenses').insert([data]);
    }
    fetchExpenses();
    setIsFormOpen(false);
  };

  if (loading) return <div className="text-center py-20 text-red-500 animate-pulse font-black">CHARGEMENT DES FINANCES...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900">{t.expenses.title}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase mt-3">Gestion des Charges Fixes</p>
        </div>
        <button 
          onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}
          className="custom-gradient-btn px-10 py-5 rounded-[2.5rem] text-white font-black text-sm shadow-2xl transition-all"
        >
          💰 {t.expenses.add}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {expenses.map(ex => (
          <div key={ex.id} className="bg-white rounded-[4rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col relative overflow-hidden h-full">
            <div className="flex-grow mb-10">
              <p className="text-[10px] font-black text-slate-300 uppercase mb-2">{ex.date}</p>
              <h3 className="text-2xl font-black text-slate-900 mb-3">{ex.name}</h3>
              <p className="text-5xl font-black text-red-600 tracking-tighter">
                {ex.cost.toLocaleString()} <span className="text-sm font-bold text-slate-400">{t.currency}</span>
              </p>
            </div>
            <div className="flex gap-4 pt-8 border-t">
              <button onClick={() => { setEditingExpense(ex); setIsFormOpen(true); }} className="flex-1 py-5 rounded-[1.8rem] bg-slate-900 text-white font-black text-[11px] uppercase transition-all">✏️ {t.actions.edit}</button>
              <button onClick={() => handleDelete(ex.id)} className="px-8 py-5 rounded-[1.8rem] bg-red-50 text-red-500 border hover:bg-red-600 hover:text-white transition-all">🗑️</button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 font-black uppercase italic">Aucune dépense enregistrée.</p>}
      </div>

      {isFormOpen && (
        <ExpenseForm 
          lang={lang} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSubmit}
          initialData={editingExpense}
        />
      )}
    </div>
  );
};

const ExpenseForm: React.FC<{ lang: Language; onClose: () => void; onSubmit: (data: any) => void; initialData: Expense | null }> = ({ lang, onClose, onSubmit, initialData }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<Partial<Expense>>(initialData || { name: '', cost: 0, date: new Date().toISOString().split('T')[0] });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[4.5rem] p-12 shadow-2xl flex flex-col">
        <h3 className="text-4xl font-black text-slate-900 mb-12">{initialData ? t.actions.edit : "Nouvelle Charge"}</h3>
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase">Désignation</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none font-bold" required />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase">Montant</label>
              <input type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none font-bold" required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none font-bold" required />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-6 pt-12 mt-6">
          <button onClick={onClose} className="px-10 py-5 rounded-[2rem] font-black uppercase text-xs">Annuler</button>
          <button onClick={() => onSubmit(formData)} className="custom-gradient-btn px-20 py-6 rounded-[2rem] text-white font-black uppercase text-xs">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};
