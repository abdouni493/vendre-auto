
import React, { useState, useEffect } from 'react';
import { Expense, Language, PurchaseRecord } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';
import { getCreatedByValue } from '../utils';

interface VehicleExpense {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_make: string;
  vehicle_model: string;
  name: string;
  cost: number;
  date: string;
  note?: string;
  created_at?: string;
}

interface ExpensesProps {
  lang: Language;
  userName?: string;
}

export const Expenses: React.FC<ExpensesProps> = ({ lang, userName }) => {
  const t = translations[lang];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingVehicleExpense, setEditingVehicleExpense] = useState<VehicleExpense | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'vehicles'>('general');
  const [vehicles, setVehicles] = useState<PurchaseRecord[]>([]);
  const [showCreatedDate, setShowCreatedDate] = useState(false);

  useEffect(() => {
    if (activeTab === 'general') {
      fetchExpenses();
    } else {
      fetchVehicleExpenses();
      fetchVehicles();
    }
  }, [activeTab]);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) console.error(error);
    else setExpenses(data || []);
    setLoading(false);
  };

  const fetchVehicleExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vehicle_expenses').select('*').order('date', { ascending: false });
    if (error) console.error(error);
    else setVehicleExpenses(data || []);
    setLoading(false);
  };

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('purchases').select('*').order('dateAdded', { ascending: false });
    if (error) console.error(error);
    else setVehicles((data || []) as PurchaseRecord[]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.suppliers.confirmDelete)) {
      await supabase.from('expenses').delete().eq('id', id);
      fetchExpenses();
    }
  };

  const handleDeleteVehicleExpense = async (id: string) => {
    if (window.confirm(t.suppliers.confirmDelete)) {
      await supabase.from('vehicle_expenses').delete().eq('id', id);
      fetchVehicleExpenses();
    }
  };

  const handleSubmit = async (data: any) => {
    // Auto-populate created_by if not already set
    const dataWithCreatedBy = {
      ...data,
      created_by: data.created_by || getCreatedByValue()
    };
    if (editingExpense) {
      await supabase.from('expenses').update(dataWithCreatedBy).eq('id', editingExpense.id);
    } else {
      await supabase.from('expenses').insert([dataWithCreatedBy]);
    }
    fetchExpenses();
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleVehicleExpenseSubmit = async (data: any) => {
    // Auto-populate created_by if not already set
    const dataWithCreatedBy = {
      ...data,
      created_by: data.created_by || getCreatedByValue()
    };
    if (editingVehicleExpense) {
      await supabase.from('vehicle_expenses').update(dataWithCreatedBy).eq('id', editingVehicleExpense.id);
    } else {
      await supabase.from('vehicle_expenses').insert([dataWithCreatedBy]);
    }
    fetchVehicleExpenses();
    setIsVehicleFormOpen(false);
    setEditingVehicleExpense(null);
  };

  const printVehicleExpenseInvoice = (expense: VehicleExpense) => {
    const content = `
      <html>
        <head>
          <title>Facture Dépense Véhicule</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .invoice { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #333; font-size: 28px; }
            .header p { margin: 5px 0 0 0; color: #666; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #333; }
            .info-value { color: #666; text-align: right; }
            .total { font-size: 24px; font-weight: bold; color: #0891b2; text-align: right; margin-top: 20px; padding: 20px; background: #f0f9fa; border-radius: 8px; }
            .note { margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #0891b2; border-radius: 4px; }
            .print-button { text-align: center; margin-top: 20px; }
            button { padding: 10px 20px; background: #0891b2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; }
            button:hover { background: #0e7490; }
            @media print {
              .print-button { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>📋 Facture Dépense Véhicule</h1>
              <p>${new Date(expense.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="info">
              <div class="info-row">
                <span class="info-label">🚗 Véhicule:</span>
                <span class="info-value">${expense.vehicle_make} ${expense.vehicle_model}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📌 Plaque:</span>
                <span class="info-value">${expense.vehicle_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📝 Type de Charge:</span>
                <span class="info-value">${expense.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span class="info-value">${new Date(expense.date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div class="total">
              Montant: ${expense.cost.toLocaleString('fr-FR')} DA
            </div>
            ${expense.note ? `<div class="note"><strong>Note:</strong> ${expense.note}</div>` : ''}
            <div class="print-button">
              <button onclick="window.print()">🖨️ Imprimer</button>
            </div>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
      setTimeout(() => newWindow.print(), 250);
    }
  };

  if (loading) return <div className="text-center py-20 text-red-500 animate-pulse font-black">CHARGEMENT DES FINANCES...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900">{t.expenses.title}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase mt-3">Gestion des Charges</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCreatedDate(!showCreatedDate)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showCreatedDate ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            📅 {showCreatedDate ? 'Masquer' : 'Afficher'} Date Création
          </button>
          <button 
            onClick={() => { 
              if (activeTab === 'general') {
                setEditingExpense(null);
                setIsFormOpen(true);
              } else {
                setEditingVehicleExpense(null);
                setIsVehicleFormOpen(true);
              }
            }}
            className="custom-gradient-btn px-10 py-5 rounded-[2.5rem] text-white font-black text-sm shadow-2xl transition-all"
          >
            💰 {activeTab === 'general' ? t.expenses.add : '+ Nouvelle Charge Véhicule'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-6 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-6 font-black uppercase text-sm transition-all ${
            activeTab === 'general'
              ? 'text-slate-900 border-b-4 border-cyan-500'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          💰 Charges Générales
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-4 px-6 font-black uppercase text-sm transition-all ${
            activeTab === 'vehicles'
              ? 'text-slate-900 border-b-4 border-cyan-500'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🚗 Dépenses Véhicules
        </button>
      </div>

      {/* General Expenses Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {expenses.map(ex => (
            <div key={ex.id} className="bg-white rounded-[4rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col relative overflow-hidden h-full">
              <div className="flex-grow mb-10">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-2">{ex.date}</p>
                {showCreatedDate && ex.created_at && (
                  <p className="text-[9px] font-black text-blue-600 uppercase mb-2">📅 Créé: {new Date(ex.created_at).toLocaleDateString('fr-FR')}</p>
                )}
                {ex.created_by && (
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-3">👤 Par: {ex.created_by}</p>
                )}
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
      )}

      {/* Vehicle Expenses Tab */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {vehicleExpenses.map(ex => (
            <div key={ex.id} className="bg-white rounded-[4rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col relative overflow-hidden h-full">
              <div className="flex-grow mb-10">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-2">🚗 {ex.vehicle_make} {ex.vehicle_model}</p>
                <p className="text-[10px] font-black text-slate-400 mb-4">Plaque: {ex.vehicle_name}</p>
                <p className="text-[10px] font-black text-slate-300 uppercase mb-2">{ex.date}</p>
                {showCreatedDate && ex.created_at && (
                  <p className="text-[9px] font-black text-blue-600 uppercase mb-2">📅 Créé: {new Date(ex.created_at).toLocaleDateString('fr-FR')}</p>
                )}
                {ex.created_by && (
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-3">👤 Par: {ex.created_by}</p>
                )}
                <h3 className="text-2xl font-black text-slate-900 mb-3">{ex.name}</h3>
                <p className="text-5xl font-black text-red-600 tracking-tighter">
                  {ex.cost.toLocaleString()} <span className="text-sm font-bold text-slate-400">{t.currency}</span>
                </p>
                {ex.note && (
                  <p className="text-sm text-slate-600 mt-4 italic">📝 {ex.note}</p>
                )}
              </div>
              <div className="flex gap-4 pt-8 border-t flex-col">
                <button onClick={() => printVehicleExpenseInvoice(ex)} className="w-full py-5 rounded-[1.8rem] bg-green-600 text-white font-black text-[11px] uppercase transition-all hover:bg-green-700">🖨️ Imprimer Facture</button>
                <div className="flex gap-4">
                  <button onClick={() => { setEditingVehicleExpense(ex); setIsVehicleFormOpen(true); }} className="flex-1 py-5 rounded-[1.8rem] bg-slate-900 text-white font-black text-[11px] uppercase transition-all">✏️ {t.actions.edit}</button>
                  <button onClick={() => handleDeleteVehicleExpense(ex.id)} className="px-8 py-5 rounded-[1.8rem] bg-red-50 text-red-500 border hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {vehicleExpenses.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 font-black uppercase italic">Aucune dépense véhicule enregistrée.</p>}
        </div>
      )}

      {isFormOpen && (
        <ExpenseForm 
          lang={lang} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSubmit}
          initialData={editingExpense}
        />
      )}

      {isVehicleFormOpen && (
        <VehicleExpenseForm 
          lang={lang} 
          onClose={() => setIsVehicleFormOpen(false)} 
          onSubmit={handleVehicleExpenseSubmit}
          initialData={editingVehicleExpense}
          vehicles={vehicles}
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

const VehicleExpenseForm: React.FC<{ 
  lang: Language; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  initialData: VehicleExpense | null;
  vehicles: PurchaseRecord[];
}> = ({ lang, onClose, onSubmit, initialData, vehicles }) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<PurchaseRecord | null>(
    initialData ? vehicles.find(v => v.id === initialData.vehicle_id) || null : null
  );
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    cost: initialData?.cost || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    note: initialData?.note || '',
  });

  const filteredVehicles = vehicles.filter(v => {
    const searchLower = searchQuery.toLowerCase();
    return (
      v.make.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      v.plate.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectVehicle = (vehicle: PurchaseRecord) => {
    setSelectedVehicle(vehicle);
    setShowVehicleSearch(false);
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!selectedVehicle) {
      alert('Veuillez sélectionner un véhicule');
      return;
    }
    onSubmit({
      vehicle_id: selectedVehicle.id,
      vehicle_name: selectedVehicle.plate,
      vehicle_make: selectedVehicle.make,
      vehicle_model: selectedVehicle.model,
      name: formData.name,
      cost: formData.cost,
      date: formData.date,
      note: formData.note,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[4.5rem] p-12 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <h3 className="text-4xl font-black text-slate-900 mb-12">{initialData ? t.actions.edit : "Nouvelle Charge Véhicule"}</h3>
        <div className="space-y-8">
          {/* Vehicle Selection */}
          <div className="space-y-3 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase">🚗 Sélectionnez un Véhicule</label>
            <button 
              onClick={() => setShowVehicleSearch(!showVehicleSearch)}
              className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none font-bold text-left text-slate-900 hover:border-slate-200 transition-all"
            >
              {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.plate})` : 'Cliquez pour rechercher...'}
            </button>
            
            {showVehicleSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-[2rem] shadow-lg z-50">
                <input
                  type="text"
                  placeholder="Rechercher par marque, modèle ou plaque..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-b-2 border-slate-100 p-4 rounded-t-[2rem] outline-none font-bold"
                  autoFocus
                />
                <div className="max-h-64 overflow-y-auto">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map(v => (
                      <button
                        key={v.id}
                        onClick={() => handleSelectVehicle(v)}
                        className="w-full text-left px-6 py-4 border-b border-slate-100 hover:bg-slate-50 font-bold"
                      >
                        <p className="text-slate-900">{v.make} {v.model}</p>
                        <p className="text-xs text-slate-500">Plaque: {v.plate}</p>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-slate-400 text-center font-bold">Aucun véhicule trouvé</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedVehicle && (
            <div className="bg-slate-50 border-2 border-cyan-200 p-4 rounded-[2rem]">
              <p className="text-sm font-black text-slate-900">
                ✅ {selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.plate}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase">Type de Charge</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none font-bold" placeholder="Ex: Vidange, Réparation..." required />
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

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase">📝 Note (Optionnelle)</label>
            <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none font-bold" placeholder="Ajouter une note..." rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-6 pt-12 mt-6">
          <button onClick={onClose} className="px-10 py-5 rounded-[2rem] font-black uppercase text-xs">Annuler</button>
          <button onClick={handleSubmit} className="custom-gradient-btn px-20 py-6 rounded-[2rem] text-white font-black uppercase text-xs">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};
