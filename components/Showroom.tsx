
import React, { useState, useEffect } from 'react';
import { PurchaseRecord, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface ShowroomProps {
  lang: Language;
  onNavigateToPurchase: () => void;
  onEdit: (car: PurchaseRecord) => void;
}

export const Showroom: React.FC<ShowroomProps> = ({ lang, onNavigateToPurchase, onEdit }) => {
  const t = translations[lang];
  const [inventory, setInventory] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setInventory(data || []);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20 animate-pulse font-black text-blue-500">SYNCHRONISATION DU STOCK...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900">{t.menu.showroom}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase mt-3">Disponibilités en Temps Réel</p>
        </div>
        <button onClick={onNavigateToPurchase} className="custom-gradient-btn px-10 py-5 rounded-[2.5rem] text-white font-black text-sm">
          🏷️ {t.purchase.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {inventory.map(car => (
          <div key={car.id} className="bg-white rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col h-full overflow-hidden">
            <div className="h-72 overflow-hidden">
               <img src={car.photos?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000'} className="w-full h-full object-cover" alt={car.model} />
            </div>
            <div className="p-10 flex flex-col flex-grow">
               <h3 className="text-3xl font-black text-slate-900 leading-none mb-2">{car.make}</h3>
               <p className="text-xl font-bold text-slate-400 tracking-tight mb-8">{car.model}</p>
               <div className="flex justify-between items-end mb-10">
                  <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase">Prix de Vente</p>
                     <p className="text-3xl font-black text-blue-600 tracking-tighter">{car.sellingPrice?.toLocaleString()} <span className="text-sm font-bold text-slate-400">{t.currency}</span></p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border">
                     <span className="text-xs font-black text-slate-900">{car.year}</span>
                  </div>
               </div>
               <div className="flex gap-4 mt-auto">
                 <button onClick={() => onEdit(car)} className="flex-1 py-5 rounded-[2rem] bg-slate-900 text-white font-black text-[11px] uppercase transition-all">✏️ {t.actions.edit}</button>
               </div>
            </div>
          </div>
        ))}
        {inventory.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 font-black">Aucun véhicule en stock.</p>}
      </div>
    </div>
  );
};
