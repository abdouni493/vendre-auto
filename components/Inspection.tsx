
import React, { useState, useMemo } from 'react';
import { InspectionRecord, Language, PurchaseRecord, SaleRecord } from '../types';
import { translations } from '../translations';

interface InspectionProps {
  lang: Language;
}

export const Inspection: React.FC<InspectionProps> = ({ lang }) => {
  const t = translations[lang];

  // Mock Data for searching
  const [purchases] = useState<PurchaseRecord[]>([
    {
      id: 'p1', supplierId: 's1', supplierName: 'Premium Export', make: 'Mercedes-Benz', model: 'G63 AMG',
      plate: '12345-123-16', year: '2023', color: 'Black', vin: 'WDC123456789', fuel: 'essence',
      transmission: 'auto', seats: 5, doors: 5, mileage: 1200, insuranceExpiry: '', techControlDate: '',
      insuranceCompany: '', photos: [], totalCost: 32000, sellingPrice: 35000, dateAdded: ''
    }
  ]);

  const [sales] = useState<SaleRecord[]>([
    {
      id: 's1', carId: 'p1', carDetails: { make: 'Mercedes-Benz', model: 'G63 AMG', year: '2023' },
      clientId: 'c1', clientName: 'Mohamed Brahimi', salePrice: 35000, saleDate: '2023-12-01', status: 'completed'
    }
  ]);

  const [inspections, setInspections] = useState<InspectionRecord[]>([
    {
      id: 'insp-1', type: 'checkin', carId: 'p1', carName: 'Mercedes-Benz G63', vin: 'WDC123456789',
      date: '2023-11-20', mileage: 1205, safety: { lights: true, tires: true, brakes: true, wipers: true, mirrors: true, seatbelts: true, horn: true },
      equipment: { spareWheel: true, jack: true, triangles: true, firstAid: false, docs: true },
      comfort: { ac: true, cleanliness: true }, partnerName: 'Premium Export', photos: { exterior: [], interior: [] }
    }
  ]);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Partial<InspectionRecord>>({
    type: 'checkin',
    safety: { lights: true, tires: true, brakes: true, wipers: true, mirrors: true, seatbelts: true, horn: true },
    equipment: { spareWheel: true, jack: true, triangles: true, firstAid: true, docs: true },
    comfort: { ac: true, cleanliness: true },
    photos: { exterior: [], interior: [] }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReference, setSelectedReference] = useState<any>(null);

  const filteredReferences = useMemo(() => {
    if (!searchQuery) return [];
    if (formData.type === 'checkin') {
      return purchases.filter(p => p.model.toLowerCase().includes(searchQuery.toLowerCase()) || p.vin.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      return sales.filter(s => s.carDetails.model.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  }, [searchQuery, formData.type, purchases, sales]);

  const handleSelectRef = (ref: any) => {
    setSelectedReference(ref);
    if (formData.type === 'checkin') {
      setFormData(prev => ({ ...prev, carId: ref.id, carName: `${ref.make} ${ref.model}`, vin: ref.vin, partnerName: ref.supplierName, mileage: ref.mileage }));
    } else {
      setFormData(prev => ({ ...prev, carId: ref.carId, carName: `${ref.carDetails.make} ${ref.carDetails.model}`, vin: '---', partnerName: ref.clientName }));
    }
    setSearchQuery('');
  };

  const handleToggle = (section: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: !(prev as any)[section][field]
      }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'exterior' | 'interior') => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            photos: {
              ...prev.photos!,
              [type]: [...prev.photos![type], reader.result as string]
            }
          }));
        };
        // Explicitly cast file to File to satisfy the Blob/File parameter requirement of readAsDataURL
        reader.readAsDataURL(file as File);
      });
    }
  };

  const finalizeInspection = () => {
    const newRecord = { ...formData, id: `insp-${Date.now()}`, date: new Date().toISOString().split('T')[0] } as InspectionRecord;
    setInspections([newRecord, ...inspections]);
    setIsWizardOpen(false);
    setWizardStep(1);
    if (window.confirm(t.inspection.printAsk)) {
      window.print();
    }
  };

  const deleteInspection = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette inspection ?')) {
      setInspections(inspections.filter(insp => insp.id !== id));
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{t.inspection.title}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Contrôle Qualité & Conformité
          </p>
        </div>
        <button 
          onClick={() => { setFormData({ type: 'checkin', safety: { lights: true, tires: true, brakes: true, wipers: true, mirrors: true, seatbelts: true, horn: true }, equipment: { spareWheel: true, jack: true, triangles: true, firstAid: true, docs: true }, comfort: { ac: true, cleanliness: true }, photos: { exterior: [], interior: [] } }); setWizardStep(1); setIsWizardOpen(true); }}
          className="group custom-gradient-btn px-10 py-5 rounded-[2.5rem] text-white font-black text-sm shadow-2xl transition-all active:scale-95 flex items-center gap-4"
        >
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          {t.inspection.new}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {inspections.map(insp => (
          <div key={insp.id} className="bg-white rounded-[4rem] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col group overflow-hidden">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${insp.type === 'checkin' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                      {insp.type === 'checkin' ? 'Check-in' : 'Check-out'}
                   </span>
                   <h3 className="text-2xl font-black text-slate-900 mt-4 leading-none tracking-tight">{insp.carName}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{insp.vin}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-slate-300 uppercase">{insp.date}</p>
                   <p className="text-xl font-black text-blue-600 mt-1">{insp.mileage} KM</p>
                </div>
             </div>
             
             <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex-grow mb-10 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partenaire Associé</p>
                <p className="text-sm font-black text-slate-800 flex items-center gap-3">
                   <span className="text-xl">{insp.type === 'checkin' ? '🤝' : '👤'}</span>
                   {insp.partnerName}
                </p>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button className="py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Détails</button>
                <button className="py-4 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all" onClick={() => window.print()}>🖨️ {t.actions.print}</button>
                <button onClick={() => deleteInspection(insp.id)} className="col-span-2 py-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">🗑️ Supprimer</button>
             </div>
          </div>
        ))}
      </div>

      {isWizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setIsWizardOpen(false)}></div>
          <div className="relative bg-white w-full max-w-5xl h-[90vh] md:max-h-[850px] overflow-hidden rounded-[4rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-500">
            
            {/* WIZARD HEADER */}
            <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl">🛡️</div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">Dossier d'Inspection</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étape {wizardStep} sur 2</p>
                  </div>
               </div>
               <button onClick={() => setIsWizardOpen(false)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:text-red-500 transition-all">✕</button>
            </div>

            {/* WIZARD CONTENT */}
            <div className="flex-grow overflow-y-auto p-10 md:p-16 custom-scrollbar">
               {wizardStep === 1 ? (
                 <div className="space-y-16 animate-in slide-in-from-right-8 duration-500">
                   
                   {/* Type & Selection */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.inspection.type}</label>
                         <div className="flex p-2 bg-slate-100 rounded-[2rem] border border-slate-200">
                            <button onClick={() => setFormData({...formData, type: 'checkin'})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${formData.type === 'checkin' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>{t.inspection.checkin}</button>
                            <button onClick={() => setFormData({...formData, type: 'checkout'})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${formData.type === 'checkout' ? 'bg-white text-purple-600 shadow-xl' : 'text-slate-400'}`}>{t.inspection.checkout}</button>
                         </div>
                      </div>

                      <div className="space-y-6 relative">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.inspection.carSearch}</label>
                         <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
                            <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-white border-2 border-slate-100 pl-16 pr-6 py-4 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all"
                              placeholder="VIN, Modèle..."
                            />
                            {filteredReferences.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                {filteredReferences.map((ref: any) => (
                                  <button key={ref.id} onClick={() => handleSelectRef(ref)} className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors">
                                    <div>
                                      <p className="font-black text-slate-800">{formData.type === 'checkin' ? `${ref.make} ${ref.model}` : `${ref.carDetails.make} ${ref.carDetails.model}`}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formData.type === 'checkin' ? ref.vin : ref.clientName}</p>
                                    </div>
                                    <span className="text-blue-600 text-lg">→</span>
                                  </button>
                                ))}
                              </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Quick Details View */}
                   {formData.carName && (
                     <div className="p-8 rounded-[3rem] bg-blue-50/50 border border-blue-100 grid grid-cols-2 md:grid-cols-4 gap-8 animate-in zoom-in-95 duration-500">
                        <div>
                           <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Véhicule Cible</p>
                           <p className="text-base font-black text-slate-900">{formData.carName}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">{formData.type === 'checkin' ? 'Fournisseur' : 'Client Acheteur'}</p>
                           <p className="text-base font-black text-slate-900">{formData.partnerName}</p>
                        </div>
                        <div className="md:col-span-2">
                           <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2">{t.inspection.mileage}</p>
                           <input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: Number(e.target.value)})} className="bg-transparent border-b-2 border-blue-200 text-2xl font-black text-blue-600 outline-none w-full" />
                        </div>
                     </div>
                   )}

                   {/* Checklists */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      <Checklist title={t.inspection.safety} icon="🛡️">
                        {Object.entries(formData.safety!).map(([key, val]) => (
                          <ToggleItem key={key} label={(t.inspection.safetyItems as any)[key]} active={val} onToggle={() => handleToggle('safety', key)} />
                        ))}
                      </Checklist>

                      <Checklist title={t.inspection.equipment} icon="🧰">
                        {Object.entries(formData.equipment!).map(([key, val]) => (
                          <ToggleItem key={key} label={(t.inspection.eqItems as any)[key]} active={val} onToggle={() => handleToggle('equipment', key)} />
                        ))}
                      </Checklist>

                      <Checklist title={t.inspection.comfort} icon="✨">
                        <ToggleItem label={t.inspection.comfortItems.ac} active={formData.comfort!.ac} onToggle={() => handleToggle('comfort', 'ac')} />
                        <ToggleItem label={t.inspection.comfortItems.cleanliness} active={formData.comfort!.cleanliness} onToggle={() => handleToggle('comfort', 'cleanliness')} />
                        <div className="pt-8">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t.inspection.note}</label>
                           <textarea value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm min-h-[100px]"></textarea>
                        </div>
                      </Checklist>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-16 animate-in slide-in-from-right-8 duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Exterior Photos */}
                      <div className="space-y-8">
                         <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                           <h4 className="text-xl font-black text-slate-900 tracking-tight">{t.inspection.extPhotos}</h4>
                           <span className="text-[10px] font-black text-blue-500">{formData.photos?.exterior.length || 0} Photos</span>
                         </div>
                         <div className="grid grid-cols-3 gap-4">
                            <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                               <input type="file" multiple className="hidden" onChange={(e) => handlePhotoUpload(e, 'exterior')} />
                               <span className="text-3xl opacity-30">📷</span>
                            </label>
                            {formData.photos?.exterior.map((p, i) => (
                              <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-md group relative">
                                 <img src={p} className="w-full h-full object-cover" />
                                 <button onClick={() => setFormData(prev => ({...prev, photos: {...prev.photos!, exterior: prev.photos!.exterior.filter((_, idx) => idx !== i)}}))} className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Interior Photos */}
                      <div className="space-y-8">
                         <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                           <h4 className="text-xl font-black text-slate-900 tracking-tight">{t.inspection.intPhotos}</h4>
                           <span className="text-[10px] font-black text-blue-500">{formData.photos?.interior.length || 0} Photos</span>
                         </div>
                         <div className="grid grid-cols-3 gap-4">
                            <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                               <input type="file" multiple className="hidden" onChange={(e) => handlePhotoUpload(e, 'interior')} />
                               <span className="text-3xl opacity-30">🚗</span>
                            </label>
                            {formData.photos?.interior.map((p, i) => (
                              <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-md group relative">
                                 <img src={p} className="w-full h-full object-cover" />
                                 <button onClick={() => setFormData(prev => ({...prev, photos: {...prev.photos!, interior: prev.photos!.interior.filter((_, idx) => idx !== i)}}))} className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="p-10 rounded-[3.5rem] bg-slate-900 text-white flex justify-between items-center">
                      <div>
                        <h4 className="text-2xl font-black tracking-tight">Prêt pour la validation finale ?</h4>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Dossier technique complet • Photos capturées</p>
                      </div>
                      <span className="text-6xl grayscale opacity-20">🏁</span>
                   </div>
                 </div>
               )}
            </div>

            {/* WIZARD FOOTER */}
            <div className="p-8 md:p-12 border-t border-slate-100 flex justify-between bg-white z-30">
               <button 
                 onClick={() => wizardStep === 1 ? setIsWizardOpen(false) : setWizardStep(1)}
                 className="px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
               >
                 {wizardStep === 1 ? t.actions.cancel : '← Précédent'}
               </button>
               <button 
                 onClick={() => wizardStep === 1 ? setWizardStep(2) : finalizeInspection()}
                 disabled={!formData.carName}
                 className="custom-gradient-btn px-16 py-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
               >
                 {wizardStep === 1 ? 'Galerie Photos →' : t.inspection.finish}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Wizard Helpers ---

const Checklist: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-8">
     <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <span className="text-2xl">{icon}</span>
        <h4 className="text-lg font-black text-slate-900 tracking-tight">{title}</h4>
     </div>
     <div className="space-y-3">{children}</div>
  </div>
);

const ToggleItem: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${active ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-100 grayscale opacity-60'}`}
  >
     <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
     <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
       {active ? '✓' : '✕'}
     </div>
  </button>
);
