
import React, { useState, useEffect } from 'react';
import { PurchaseRecord, Language, Supplier } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface PurchaseProps {
  lang: Language;
  initialEditRecord?: PurchaseRecord | null;
  onClearEdit?: () => void;
}

export const Purchase: React.FC<PurchaseProps> = ({ lang, initialEditRecord, onClearEdit }) => {
  const t = translations[lang];
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseRecord | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (initialEditRecord) {
      setEditingRecord(initialEditRecord);
      setIsFormOpen(true);
    }
  }, [initialEditRecord]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingRecord) {
        await supabase.from('purchases').update(data).eq('id', editingRecord.id);
      } else {
        await supabase.from('purchases').insert([data]);
      }
      await fetchPurchases();
      setIsFormOpen(false);
      setEditingRecord(null);
      if (onClearEdit) onClearEdit();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="h-16 w-16 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
      <p className="font-black text-blue-600 uppercase tracking-[0.4em] text-[10px]">Ouverture du registre des achats...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-slate-50 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.purchase.title}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-3">Mise à jour du Stock Showroom</p>
        </div>
        <button 
          onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
          className="custom-gradient-btn px-14 py-5 rounded-[2.5rem] text-white font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-xl active:scale-95 transition-all"
        >
          <span className="text-2xl">🏷️</span> {t.purchase.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {purchases.map(p => (
          <div key={p.id} className="bg-white rounded-[3.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden h-full group">
            <div className="relative h-64 overflow-hidden">
               <img 
                 src={p.photos?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000'} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                 alt={p.model} 
               />
               <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
                  <span className="text-xs font-black text-blue-600">{p.year}</span>
               </div>
               <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{p.fuel} • {p.transmission}</span>
               </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
               <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{p.make}</h3>
               <p className="text-lg font-bold text-slate-400 mb-6">{p.model}</p>
               
               <div className="bg-slate-50 p-6 rounded-[2.2rem] mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prix de Vente Showroom</p>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter">
                    {p.sellingPrice?.toLocaleString()} <span className="text-sm font-bold opacity-40">{t.currency}</span>
                  </p>
               </div>

               <div className="flex gap-3 mt-auto">
                 <button 
                   onClick={() => { setEditingRecord(p); setIsFormOpen(true); }} 
                   className="flex-grow py-4.5 rounded-[1.5rem] bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-600"
                 >
                   ✏️ Modifier
                 </button>
                 <button 
                   onClick={async () => { if(confirm(t.purchase.confirmDelete)) { await supabase.from('purchases').delete().eq('id', p.id); fetchPurchases(); } }} 
                   className="h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                 >
                   🗑️
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <PurchaseForm 
          lang={lang} 
          onClose={() => { setIsFormOpen(false); setEditingRecord(null); if(onClearEdit) onClearEdit(); }} 
          onSubmit={handleSave}
          initialData={editingRecord}
        />
      )}
    </div>
  );
};

const PurchaseForm: React.FC<{ lang: Language; onClose: () => void; onSubmit: (data: any) => void; initialData: PurchaseRecord | null }> = ({ lang, onClose, onSubmit, initialData }) => {
  const t = translations[lang];
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<Partial<PurchaseRecord>>(initialData || {
    supplierId: '', supplierName: '', make: '', model: '', year: new Date().getFullYear().toString(),
    color: '', vin: '', fuel: 'essence', transmission: 'manuelle', seats: 5, doors: 5, mileage: 0,
    insuranceExpiry: '', techControlDate: '', insuranceCompany: '', photos: [], totalCost: 0, sellingPrice: 0
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase.from('suppliers').select('id, name');
      setSuppliers(data || []);
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: ['totalCost', 'sellingPrice', 'mileage', 'seats', 'doors'].includes(name) ? Number(value) : value 
    }));
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = suppliers.find(sup => sup.id === e.target.value);
    setFormData(prev => ({ ...prev, supplierId: e.target.value, supplierName: s?.name || '' }));
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file as File);
        });
      });
      Promise.all(readers).then(results => {
        setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...results] }));
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-6xl h-full max-h-[90vh] overflow-hidden rounded-[4rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white">
        
        {/* Header */}
        <div className="px-12 py-10 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-[1.8rem] bg-blue-600 text-white flex items-center justify-center text-4xl shadow-xl">🛒</div>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">{initialData ? "Modifier l'Achat" : "Nouvel Achat Véhicule"}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Acquisition Showroom</p>
            </div>
          </div>
          <button onClick={onClose} className="h-14 w-14 bg-white border border-slate-100 rounded-full flex items-center justify-center text-2xl hover:bg-red-50 text-slate-400 shadow-sm">✕</button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar bg-white px-12 pb-12">
          <div className="space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* SECTION 1: SOURCE & IDENTITÉ */}
              <Section title="Source & Identité" icon="🤝">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Partenaire Fournisseur</label>
                       <select 
                         name="supplierId" 
                         value={formData.supplierId} 
                         onChange={handleSupplierChange}
                         className="w-full bg-slate-50 border-2 border-slate-100 px-8 py-5 rounded-[2rem] outline-none focus:border-blue-500 font-bold text-slate-800 appearance-none shadow-inner text-lg"
                       >
                         <option value="">Sélectionner un fournisseur...</option>
                         {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                    <Field label="Marque" name="make" value={formData.make} onChange={handleChange} />
                    <Field label="Modèle" name="model" value={formData.model} onChange={handleChange} />
                    <Field label="Année" name="year" value={formData.year} onChange={handleChange} />
                    <Field label="Couleur" name="color" value={formData.color} onChange={handleChange} />
                    <div className="sm:col-span-2">
                      <Field label="Numéro de Châssis (VIN)" name="vin" value={formData.vin} onChange={handleChange} />
                    </div>
                 </div>
              </Section>

              {/* SECTION 2: CARACTÉRISTIQUES */}
              <Section title="Caractéristiques" icon="⚙️">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Transmission</label>
                       <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                          {['manuelle', 'auto'].map(t => (
                            <button key={t} type="button" onClick={() => setFormData({...formData, transmission: t as any})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.transmission === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                               {t}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Énergie</label>
                       <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                          {['essence', 'diesel'].map(e => (
                            <button key={e} type="button" onClick={() => setFormData({...formData, fuel: e as any})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.fuel === e ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                               {e}
                            </button>
                          ))}
                       </div>
                    </div>
                    <Field label="Kilométrage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                       <Field label="Places" name="seats" type="number" value={formData.seats} onChange={handleChange} />
                       <Field label="Portes" name="doors" type="number" value={formData.doors} onChange={handleChange} />
                    </div>
                 </div>
              </Section>

              {/* SECTION 3: MÉDIA & VISUELS */}
              <Section title="Média & Visuels" icon="📸">
                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {formData.photos?.map((p, i) => (
                      <div key={i} className="h-44 w-36 shrink-0 rounded-[2.5rem] border-[4px] border-white shadow-xl overflow-hidden group/img relative">
                         <img src={p} className="w-full h-full object-cover" />
                         <button onClick={() => setFormData({...formData, photos: formData.photos?.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 h-7 w-7 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">✕</button>
                      </div>
                    ))}
                    <label className="h-44 w-36 shrink-0 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-500 transition-all text-blue-500">
                       <input type="file" multiple className="hidden" onChange={handlePhotos} />
                       <span className="text-4xl">➕</span>
                    </label>
                 </div>
              </Section>

              {/* SECTION 4: ADMINISTRATION */}
              <Section title="Administration" icon="📜">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Expiration Assurance" name="insuranceExpiry" type="date" value={formData.insuranceExpiry} onChange={handleChange} />
                    <Field label="Contrôle Technique" name="techControlDate" type="date" value={formData.techControlDate} onChange={handleChange} />
                    <div className="sm:col-span-2">
                       <Field label="Compagnie d'Assurance" name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange} placeholder="Ex: SAA, AXA..." />
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Investissement Initial (Achat)</label>
                          <div className="relative">
                            <input type="number" name="totalCost" value={formData.totalCost} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 px-8 py-5 rounded-[2rem] outline-none focus:border-red-500 font-black text-red-600 text-xl shadow-inner" />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">DA</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Prix de Vente Showroom</label>
                          <div className="relative">
                            <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="w-full bg-blue-50 border-2 border-blue-100 px-8 py-5 rounded-[2rem] outline-none focus:border-blue-500 font-black text-blue-600 text-2xl shadow-inner" />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-blue-300">DA</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </Section>

            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-12 py-10 bg-white border-t border-slate-50 flex items-center justify-center gap-8 shrink-0">
          <button onClick={onClose} className="px-16 py-5 bg-white border border-slate-100 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50">Annuler</button>
          <button onClick={() => onSubmit(formData)} className="custom-gradient-btn px-24 py-5 rounded-[2.5rem] text-white font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Enregistrer le véhicule</button>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-[#fcfcfc] rounded-[3.5rem] p-10 space-y-8 border border-slate-100/50">
     <div className="flex items-center gap-6">
        <div className="h-12 w-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-2xl shadow-sm border border-slate-100">{icon}</div>
        <h4 className="text-xl font-black text-slate-800 tracking-tight">{title}</h4>
     </div>
     <div>{children}</div>
  </div>
);

const Field: React.FC<{ label: string; name: string; value: any; onChange: any; type?: string; placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">{label}</label>
     <input 
       type={type} 
       name={name} 
       value={value} 
       onChange={onChange} 
       placeholder={placeholder}
       className="w-full bg-white border-2 border-slate-100 px-8 py-4.5 rounded-[2rem] outline-none focus:border-blue-500 font-bold text-slate-800 shadow-sm transition-all text-lg" 
     />
  </div>
);
