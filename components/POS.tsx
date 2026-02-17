
import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseRecord, Language, SaleRecord, InvoiceDesign, ElementPosition, CustomText } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface POSProps {
  lang: Language;
}

const defaultInvoiceDesign: InvoiceDesign = {
  logoPosition: { x: 0, y: 0 },
  titlePosition: { x: 0, y: 0 },
  clientInfoPosition: { x: 0, y: 0 },
  carInfoPosition: { x: 0, y: 0 },
  financialsPosition: { x: 0, y: 0 },
  extraTexts: [],
  primaryColor: '#0f172a',
  secondaryColor: '#64748b',
  accentColor: '#2563eb',
  fontSizeBase: 12,
  headerPadding: 60,
  showChecklist: false,
  labels: {
    title: 'FACTURE DE VENTE VÉHICULE',
    total: 'MONTANT TOTAL TRANSACTION',
    date: 'DATE DE VENTE',
    ref: 'FACTURE N°',
    safetyTitle: 'Informations Client',
    equipmentTitle: 'Détails du Véhicule',
    comfortTitle: 'Conditions Financières',
    partnerLabel: 'Acquéreur',
    carLabel: 'Unité Commercialisée'
  }
};

type EditableField = 'logo' | 'title' | 'client' | 'car' | 'finance' | 'extra' | 'none';

export const POS: React.FC<POSProps> = ({ lang }) => {
  const t = translations[lang];
  const [inventory, setInventory] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<PurchaseRecord | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States pour le Studio d'Impression
  const [printingSale, setPrintingSale] = useState<SaleRecord | null>(null);
  const [printDesign, setPrintDesign] = useState<InvoiceDesign>(defaultInvoiceDesign);
  const [selectedElement, setSelectedElement] = useState<{ type: EditableField; id?: string }>({ type: 'none' });

  // States Financiers
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // State Formulaire Client
  const [formData, setFormData] = useState<Partial<SaleRecord>>({
    gender: 'M',
    doc_type: "Biometric Driver's License",
  });

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  const fetchAvailableCars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        const { data: allData } = await supabase.from('purchases').select('*');
        setInventory(allData || []);
      } else {
        setInventory(data || []);
      }
    } catch (err) {
      console.error('Inventory Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const balance = useMemo(() => {
    const b = totalPrice - amountPaid;
    return b < 0 ? 0 : b;
  }, [totalPrice, amountPaid]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'scan' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleFinalize = async () => {
    if (!selectedCar || !formData.first_name || !formData.last_name || !formData.mobile1 || !formData.doc_number || totalPrice <= 0) {
      alert("Erreur: Veuillez remplir au moins le Prénom, le Nom, le Mobile, le N° de Document et le Prix.");
      return;
    }
    setIsSubmitting(true);
    const saleData = {
      car_id: selectedCar.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      dob: formData.dob || null,
      gender: formData.gender || 'M',
      pob: formData.pob || '',
      address: formData.address || '',
      profession: formData.profession || '',
      mobile1: formData.mobile1,
      mobile2: formData.mobile2 || '',
      nif: formData.nif || '',
      rc: formData.rc || '',
      nis: formData.nis || '',
      art: formData.art || '',
      doc_type: formData.doc_type || '',
      doc_number: formData.doc_number,
      issue_date: formData.issue_date || null,
      expiry_date: formData.expiry_date || null,
      photo: formData.photo || null,
      scan: formData.scan || null,
      signature: formData.signature || null,
      total_price: totalPrice,
      amount_paid: amountPaid,
      balance: balance,
      status: balance > 0 ? 'debt' : 'completed'
    };
    try {
      const { data: insertedSale, error: saleError } = await supabase.from('sales').insert([saleData]).select();
      if (saleError) throw saleError;
      await supabase.from('purchases').update({ is_sold: true }).eq('id', selectedCar.id);
      if (insertedSale && insertedSale[0]) {
        setPrintingSale({ ...saleData, id: insertedSale[0].id, created_at: insertedSale[0].created_at });
      }
      setIsDrafting(false);
      setSelectedCar(null);
      setTotalPrice(0);
      setAmountPaid(0);
      setFormData({ gender: 'M', doc_type: "Biometric Driver's License" });
      fetchAvailableCars();
    } catch (err: any) {
      alert(`Erreur Transactionnelle : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExtraText = () => {
    const newText: CustomText = {
      id: `text-${Date.now()}`,
      content: 'Nouveau texte personnalisable',
      x: 0,
      y: 0,
      fontSize: 12,
      color: '#000000',
      isBold: false
    };
    setPrintDesign(prev => ({ ...prev, extraTexts: [...prev.extraTexts, newText] }));
    setSelectedElement({ type: 'extra', id: newText.id });
  };

  const updateExtraText = (id: string, updates: Partial<CustomText>) => {
    setPrintDesign(prev => ({
      ...prev,
      extraTexts: prev.extraTexts.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const removeExtraText = (id: string) => {
    setPrintDesign(prev => ({ ...prev, extraTexts: prev.extraTexts.filter(t => t.id !== id) }));
    setSelectedElement({ type: 'none' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="h-20 w-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-8 font-black text-blue-600 uppercase tracking-widest text-[10px]">Ouverture du Showroom...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-8 pb-10">
      
      {/* FACTURE PRINT STUDIO INTERACTIF */}
      {printingSale && (
        <div className="fixed inset-0 z-[150] bg-slate-100 flex overflow-hidden animate-in fade-in">
           {/* Inspecteur Latéral */}
           <div className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-lg">🎨</div>
                 <div>
                   <h3 className="font-black text-slate-900 tracking-tight">Studio AutoLux</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Éditeur de Facture</p>
                 </div>
               </div>
               <button onClick={() => setPrintingSale(null)} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-xl hover:bg-red-50 transition-all">✕</button>
             </div>
             
             <div className="flex-grow overflow-y-auto p-8 space-y-12 custom-scrollbar">
                {selectedElement.type === 'none' && (
                  <div className="py-20 text-center space-y-6 opacity-40">
                    <span className="text-7xl">🖱️</span>
                    <p className="text-sm font-black uppercase tracking-widest leading-relaxed">Cliquer sur un texte de l'aperçu <br/> pour le déplacer ou le modifier</p>
                    <button onClick={addExtraText} className="custom-gradient-btn px-8 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl">Ajouter Mention Libre +</button>
                  </div>
                )}

                {selectedElement.type === 'logo' && (
                  <InspectorGroup title="Position Logo" icon="🏎️">
                    <InspectorPosition value={printDesign.logoPosition} onChangeX={(v) => setPrintDesign({...printDesign, logoPosition: {...printDesign.logoPosition, x: v}})} onChangeY={(v) => setPrintDesign({...printDesign, logoPosition: {...printDesign.logoPosition, y: v}})} />
                    <InspectorRange label="Espacement Haut" value={printDesign.headerPadding} min={20} max={200} onChange={(v) => setPrintDesign({...printDesign, headerPadding: v})} />
                  </InspectorGroup>
                )}

                {selectedElement.type === 'title' && (
                  <InspectorGroup title="Titre Document" icon="🖋️">
                    <InspectorText label="Texte Titre" value={printDesign.labels.title} onChange={(v) => setPrintDesign({...printDesign, labels: {...printDesign.labels, title: v}})} />
                    <InspectorColor label="Couleur Marque" value={printDesign.primaryColor} onChange={(v) => setPrintDesign({...printDesign, primaryColor: v})} />
                    <InspectorPosition value={printDesign.titlePosition} onChangeX={(v) => setPrintDesign({...printDesign, titlePosition: {...printDesign.titlePosition, x: v}})} onChangeY={(v) => setPrintDesign({...printDesign, titlePosition: {...printDesign.titlePosition, y: v}})} />
                  </InspectorGroup>
                )}

                {(['client', 'car', 'finance'] as EditableField[]).includes(selectedElement.type) && (
                  <InspectorGroup title={`Bloc ${selectedElement.type === 'client' ? 'Acheteur' : selectedElement.type === 'car' ? 'Véhicule' : 'Finance'}`} icon="📦">
                    <InspectorPosition 
                      value={selectedElement.type === 'client' ? printDesign.clientInfoPosition : selectedElement.type === 'car' ? printDesign.carInfoPosition : printDesign.financialsPosition} 
                      onChangeX={(v) => setPrintDesign({...printDesign, [`${selectedElement.type}InfoPosition` as keyof InvoiceDesign]: {...(printDesign as any)[`${selectedElement.type}InfoPosition`], x: v}} as any)} 
                      onChangeY={(v) => setPrintDesign({...printDesign, [`${selectedElement.type}InfoPosition` as keyof InvoiceDesign]: {...(printDesign as any)[`${selectedElement.type}InfoPosition`], y: v}} as any)} 
                    />
                  </InspectorGroup>
                )}

                {selectedElement.type === 'extra' && selectedElement.id && (
                  <InspectorGroup title="Mention Spéciale" icon="✍️">
                    <InspectorText label="Texte" value={printDesign.extraTexts.find(t=>t.id===selectedElement.id)?.content || ''} onChange={(v) => updateExtraText(selectedElement.id!, {content: v})} />
                    <InspectorPosition value={{x: printDesign.extraTexts.find(t=>t.id===selectedElement.id)?.x || 0, y: printDesign.extraTexts.find(t=>t.id===selectedElement.id)?.y || 0}} onChangeX={(v) => updateExtraText(selectedElement.id!, {x: v})} onChangeY={(v) => updateExtraText(selectedElement.id!, {y: v})} />
                    <InspectorRange label="Taille" value={printDesign.extraTexts.find(t=>t.id===selectedElement.id)?.fontSize || 12} min={8} max={40} onChange={(v) => updateExtraText(selectedElement.id!, {fontSize: v})} />
                    <button onClick={() => removeExtraText(selectedElement.id!)} className="w-full py-4 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">Supprimer la mention</button>
                  </InspectorGroup>
                )}
             </div>

             <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <button onClick={addExtraText} className="w-full bg-white border border-slate-200 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Ajouter Mention Libre +</button>
                <button onClick={() => window.print()} className="w-full custom-gradient-btn py-6 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl">Imprimer Dossier 🖨️</button>
             </div>
           </div>

           {/* Zone Aperçu Facture */}
           <div className="flex-grow overflow-y-auto p-20 flex justify-center bg-slate-200/50 custom-scrollbar">
             <div className="bg-white shadow-2xl w-full max-w-[850px] min-h-[1130px] p-20 flex flex-col print:shadow-none print:m-0 print:p-10 relative overflow-hidden h-fit mb-40">
                
                {/* Header Interactif */}
                <div style={{ paddingBottom: `${printDesign.headerPadding}px` }} className="flex flex-col items-center">
                   <div 
                     onClick={() => setSelectedElement({ type: 'logo' })} 
                     style={{ transform: `translate(${printDesign.logoPosition.x}px, ${printDesign.logoPosition.y}px)` }} 
                     className={`cursor-pointer transition-all ${selectedElement.type === 'logo' ? 'ring-4 ring-blue-500 ring-offset-4' : 'hover:opacity-70'}`}
                   >
                      <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-5xl text-white shadow-xl">🏎️</div>
                   </div>
                   <div 
                     onClick={() => setSelectedElement({ type: 'title' })} 
                     style={{ transform: `translate(${printDesign.titlePosition.x}px, ${printDesign.titlePosition.y}px)` }} 
                     className={`cursor-pointer transition-all mt-10 w-full text-center ${selectedElement.type === 'title' ? 'ring-4 ring-blue-500 ring-offset-4 bg-blue-50/30' : 'hover:opacity-70'}`}
                   >
                      <h1 style={{ color: printDesign.primaryColor }} className="text-4xl font-black uppercase tracking-tighter leading-none">{printDesign.labels.title}</h1>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">AutoLux Showroom - Excellence & Prestige</p>
                   </div>
                </div>

                {/* Section Client Détails Interactif */}
                <div 
                  onClick={() => setSelectedElement({ type: 'client' })}
                  style={{ transform: `translate(${printDesign.clientInfoPosition.x}px, ${printDesign.clientInfoPosition.y}px)` }}
                  className={`grid grid-cols-2 gap-16 my-16 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 cursor-pointer transition-all ${selectedElement.type === 'client' ? 'ring-4 ring-blue-500 ring-offset-4 bg-blue-50' : 'hover:bg-slate-100'}`}
                >
                   <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquéreur</p>
                        <p className="font-black text-xl">{printingSale.first_name} {printingSale.last_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse & Résidence</p>
                        <p className="font-bold text-sm text-slate-600 leading-snug">{printingSale.address || 'Non spécifiée'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">NIF</p>
                          <p className="font-bold text-xs">{printingSale.nif || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">RC</p>
                          <p className="font-bold text-xs">{printingSale.rc || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                   <div className="text-right space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Facture & Date</p>
                        <p className="font-black text-lg">#VNT-{printingSale.id?.slice(0,8).toUpperCase()}</p>
                        <p className="text-sm font-bold text-slate-400">{new Date(printingSale.created_at!).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Présenté</p>
                        <p className="font-bold text-sm text-slate-600">{printingSale.doc_type} N° {printingSale.doc_number}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Client</p>
                        <p className="font-black text-slate-800">{printingSale.mobile1}</p>
                      </div>
                   </div>
                </div>

                {/* Section Véhicule Détails Interactif */}
                <div 
                  onClick={() => setSelectedElement({ type: 'car' })}
                  style={{ transform: `translate(${printDesign.carInfoPosition.x}px, ${printDesign.carInfoPosition.y}px)` }}
                  className={`p-10 border-2 border-slate-900 rounded-[3rem] space-y-8 cursor-pointer transition-all ${selectedElement.type === 'car' ? 'ring-4 ring-blue-500 ring-offset-4 bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                   <div className="flex justify-between items-center border-b border-slate-900 pb-6">
                      <h4 className="text-xl font-black tracking-tighter uppercase">Désignation de l'unité</h4>
                      <span className="px-4 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Certifié Showroom</span>
                   </div>
                   <div className="grid grid-cols-3 gap-8">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase">Modèle</p>
                         <p className="font-black text-lg leading-none">{inventory.find(i=>i.id===printingSale.car_id)?.make} {inventory.find(i=>i.id===printingSale.car_id)?.model}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase">Année / Chassis</p>
                         <p className="font-black text-lg leading-none">{inventory.find(i=>i.id===printingSale.car_id)?.year} • {inventory.find(i=>i.id===printingSale.car_id)?.vin?.slice(-6).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase">Configuration</p>
                         <p className="font-black text-lg leading-none uppercase">{inventory.find(i=>i.id===printingSale.car_id)?.fuel} • {inventory.find(i=>i.id===printingSale.car_id)?.transmission}</p>
                      </div>
                   </div>
                </div>

                {/* Section Finance Interactif */}
                {/* Fixed duplicate style attribute by merging them into one */}
                <div 
                   onClick={() => setSelectedElement({ type: 'finance' })}
                   style={{ 
                     transform: `translate(${printDesign.financialsPosition.x}px, ${printDesign.financialsPosition.y}px)`,
                     borderColor: printDesign.primaryColor 
                   }}
                   className={`mt-16 border-t-2 pt-12 flex justify-between items-end cursor-pointer transition-all ${selectedElement.type === 'finance' ? 'ring-4 ring-blue-500 ring-offset-4 bg-blue-50/50' : 'hover:opacity-70'}`}
                >
                   <div className="space-y-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Versement Réalisé</p>
                         <p className="text-3xl font-black text-green-600 tracking-tighter">{printingSale.amount_paid.toLocaleString()} DA</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reste à Encaisser</p>
                         <p className="text-5xl font-black" style={{ color: printDesign.primaryColor }}>{printingSale.balance.toLocaleString()} DA</p>
                      </div>
                   </div>
                   <div className="h-40 w-64 border-2 border-slate-100 border-dashed rounded-[3.5rem] flex flex-col items-center justify-center opacity-40">
                      <span className="text-[8px] font-black uppercase tracking-widest mb-12">Signature & Cachet</span>
                      <span className="text-xl font-black tracking-tighter opacity-10 grayscale">🏎️ AUTOLUX</span>
                   </div>
                </div>

                {/* Textes Supplémentaires Mobiles */}
                {printDesign.extraTexts.map(txt => (
                  <div 
                    key={txt.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'extra', id: txt.id }); }}
                    style={{ 
                      position: 'absolute', 
                      left: `calc(50% + ${txt.x}px)`, 
                      top: `calc(50% + ${txt.y}px)`,
                      fontSize: `${txt.fontSize}px`,
                      color: txt.color,
                      fontWeight: txt.isBold ? '900' : '500',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 100
                    }}
                    className={`cursor-move px-4 py-2 rounded-lg transition-all ${selectedElement.id === txt.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    {txt.content}
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {/* Catalogue & Catalogue - Reste du POS inchangé pour la stabilité */}
      {!isDrafting ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
          <div className="flex justify-between items-center px-4">
             <div>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Catalogue de Vente</h3>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 italic">UNITÉS DISPONIBLES EN SHOWROOM</p>
             </div>
             {selectedCar && (
               <button onClick={() => { setIsDrafting(true); setTotalPrice(selectedCar.sellingPrice); }} className="custom-gradient-btn px-16 py-6 rounded-[2.5rem] text-white font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 animate-in zoom-in-75">Ouvrir Dossier Client →</button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
             {inventory.map(car => (
               <button key={car.id} onClick={() => setSelectedCar(car)} className={`group relative text-left p-8 rounded-[4rem] border-4 transition-all duration-500 ${selectedCar?.id === car.id ? 'border-blue-600 bg-white shadow-2xl scale-[1.05]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                 <div className="aspect-[16/10] rounded-[3.5rem] overflow-hidden mb-8 border border-slate-50 relative">
                    <img src={car.photos?.[0] || 'https://via.placeholder.com/400x250?text=AutoLux'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{car.make} {car.model}</h4>
                 <p className="text-sm font-black text-blue-500 mt-2 uppercase tracking-widest">{car.year} • {car.sellingPrice?.toLocaleString()} DA</p>
                 {selectedCar?.id === car.id && <div className="absolute -top-4 -right-4 bg-blue-600 text-white h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-2xl ring-4 ring-white animate-in zoom-in-75">✓</div>}
               </button>
             ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-16 animate-in fade-in slide-in-from-right-10 duration-500 max-w-[1400px] mx-auto w-full pb-20">
          <div className="flex-grow space-y-12 lg:w-2/3">
             <div className="flex items-center justify-between px-4">
                <button onClick={() => setIsDrafting(false)} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">← Retour</button>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Vente de : {selectedCar?.model}</h3>
             </div>
             
             <div className="space-y-12">
                <Card title="Identité Acheteur" icon="👤">
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                      <div className="md:col-span-4 flex flex-col items-center">
                         <div className="relative group w-48 h-48">
                            <div className="w-full h-full rounded-[4.5rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center text-7xl overflow-hidden group-hover:bg-blue-50 transition-colors">
                               {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : '👤'}
                            </div>
                            <label className="absolute bottom-2 right-2 h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:bg-blue-600 shadow-2xl transition-all">
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} />
                               <span className="text-2xl">📷</span>
                            </label>
                         </div>
                      </div>
                      <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                         <FlowInput label="Prénom" name="first_name" value={formData.first_name} onChange={handleInputChange} required icon="🖋️" />
                         <FlowInput label="Nom" name="last_name" value={formData.last_name} onChange={handleInputChange} required icon="🖋️" />
                         <FlowInput label="Date de Naissance" name="dob" type="date" value={formData.dob} onChange={handleInputChange} icon="🎂" />
                         <FlowInput label="Sexe" name="gender" type="select" value={formData.gender} onChange={handleInputChange} options={[{v:'M', l:'Masculin'}, {v:'F', l:'Féminin'}]} />
                      </div>
                      <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                         <FlowInput label="Lieu de Naissance" name="pob" value={formData.pob} onChange={handleInputChange} icon="📍" />
                         <FlowInput label="Adresse Résidentielle" name="address" value={formData.address} onChange={handleInputChange} icon="🏠" />
                      </div>
                   </div>
                </Card>

                <Card title="Contact & Profession" icon="💼">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FlowInput label="Profession" name="profession" value={formData.profession} onChange={handleInputChange} icon="🛠️" />
                      <FlowInput label="Mobile Principal" name="mobile1" value={formData.mobile1} onChange={handleInputChange} required icon="📱" />
                      <FlowInput label="Mobile Secondaire" name="mobile2" value={formData.mobile2} onChange={handleInputChange} icon="📞" />
                   </div>
                   <div className="mt-12 p-12 bg-slate-50 rounded-[3.5rem] grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <FlowInput label="NIF" name="nif" value={formData.nif} onChange={handleInputChange} />
                      <FlowInput label="RC" name="rc" value={formData.rc} onChange={handleInputChange} />
                      <FlowInput label="NIS" name="nis" value={formData.nis} onChange={handleInputChange} />
                      <FlowInput label="ART" name="art" value={formData.art} onChange={handleInputChange} />
                   </div>
                </Card>

                <Card title="Documents de Bord" icon="📜">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <FlowInput label="Type de Document" name="doc_type" type="select" value={formData.doc_type} onChange={handleInputChange} icon="🛂" options={[{v:"Permis", l:"Permis Biométrique"}, {v:"CNI", l:"Carte d'Identité"}, {v:"Passeport", l:"Passeport"}]} />
                         <FlowInput label="Numéro de Document" name="doc_number" value={formData.doc_number} onChange={handleInputChange} required icon="🆔" />
                         <div className="grid grid-cols-2 gap-6">
                            <FlowInput label="Émis le" name="issue_date" type="date" value={formData.issue_date} onChange={handleInputChange} />
                            <FlowInput label="Expire le" name="expiry_date" type="date" value={formData.expiry_date} onChange={handleInputChange} />
                         </div>
                      </div>
                      <div className="flex flex-col gap-6">
                        <div className="flex-grow border-4 border-dashed border-slate-100 rounded-[3.5rem] p-10 flex flex-col items-center justify-center relative group">
                           {formData.scan ? <img src={formData.scan} className="w-full h-full object-contain" /> : (
                             <div className="text-center opacity-20"><span className="text-6xl mb-4 block">📑</span><p className="text-[10px] font-black uppercase tracking-widest">Scanner ID / Permis</p></div>
                           )}
                           <label className="absolute bottom-6 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all shadow-xl">
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'scan')} />
                              Importer Scan
                           </label>
                        </div>
                        <div className="h-44 border-4 border-dashed border-slate-100 rounded-[3.5rem] p-8 flex flex-col items-center justify-center relative group">
                           {formData.signature ? <img src={formData.signature} className="w-full h-full object-contain" /> : (
                             <div className="text-center opacity-20"><span className="text-4xl mb-2 block">🖋️</span><p className="text-[10px] font-black uppercase tracking-widest">Signature Client</p></div>
                           )}
                           <label className="absolute bottom-4 px-8 py-3 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-green-700 transition-all shadow-xl">
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'signature')} />
                              Capturer Signature
                           </label>
                        </div>
                      </div>
                   </div>
                </Card>
             </div>
          </div>

          <div className="lg:w-1/3">
             <div className="sticky top-12 space-y-10 animate-in slide-in-from-top-10 duration-700">
                <div className="bg-white rounded-[4.5rem] p-12 text-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative border border-slate-100">
                   <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-10">
                      <div className="h-28 w-28 rounded-[3rem] overflow-hidden border-2 border-slate-100 shadow-lg">
                         <img src={selectedCar?.photos?.[0]} className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{selectedCar?.make} {selectedCar?.year}</p>
                         <h4 className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{selectedCar?.model}</h4>
                      </div>
                   </div>
                   
                   <div className="space-y-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Prix de Vente Final</label>
                        <div className="relative group">
                          <input type="number" value={totalPrice || ''} onChange={(e) => setTotalPrice(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-100 px-10 py-6 rounded-[2.5rem] outline-none focus:border-blue-500 font-black text-4xl text-slate-900 tracking-tighter transition-all" />
                          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">DA</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Montant Encaissé (Acompte)</label>
                        <div className="relative group">
                          <input type="number" value={amountPaid || ''} onChange={(e) => setAmountPaid(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-100 px-10 py-6 rounded-[2.5rem] outline-none focus:border-green-500 font-black text-4xl text-green-600 tracking-tighter transition-all" />
                          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">DA</span>
                        </div>
                      </div>

                      <div className={`p-10 rounded-[3.5rem] border-2 transition-all duration-1000 ${balance > 0 ? 'bg-red-50 border-red-100 shadow-red-500/5' : 'bg-green-50 border-green-100 shadow-green-500/5'}`}>
                         <div className="flex justify-between items-center">
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Solde à Payer</p>
                               <p className={`text-5xl font-black tracking-tighter ${balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                  {balance.toLocaleString()} <span className="text-sm font-bold opacity-30">DA</span>
                               </p>
                            </div>
                            <div className={`h-16 w-16 rounded-[1.8rem] flex items-center justify-center text-3xl shadow-2xl transition-all duration-700 ${balance > 0 ? 'bg-red-500 text-white' : 'bg-green-600 text-white animate-bounce'}`}>
                               {balance > 0 ? '⏳' : '✅'}
                            </div>
                         </div>
                      </div>
                   </div>

                   <button onClick={handleFinalize} disabled={isSubmitting} className="w-full mt-14 py-8 rounded-[3rem] font-black uppercase text-sm tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 custom-gradient-btn text-white">
                     {isSubmitting ? 'Synchronisation Cloud...' : 'Confirmer la Vente 💎'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- INSPECTOR COMPONENTS ---
const InspectorGroup: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
     <div className="flex items-center gap-4 text-slate-900"><span className="text-2xl">{icon}</span><h4 className="text-[10px] font-black uppercase tracking-widest">{title}</h4></div>
     <div className="space-y-6">{children}</div>
  </div>
);
const InspectorRange: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest"><span>{label}</span><span className="text-blue-600">{value}px</span></div>
     <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" />
  </div>
);
const InspectorPosition: React.FC<{ value: ElementPosition; onChangeX: (v: number) => void; onChangeY: (v: number) => void }> = ({ value, onChangeX, onChangeY }) => (
  <div className="grid grid-cols-2 gap-6">
     <div className="space-y-3"><div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest"><span>Axe X</span><span className="text-blue-600">{value.x}px</span></div><input type="range" min={-400} max={400} value={value.x} onChange={(e) => onChangeX(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" /></div>
     <div className="space-y-3"><div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest"><span>Axe Y</span><span className="text-blue-600">{value.y}px</span></div><input type="range" min={-400} max={400} value={value.y} onChange={(e) => onChangeY(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" /></div>
  </div>
);
const InspectorColor: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer shadow-sm" /></div>
);
const InspectorText: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl outline-none font-bold text-xs" /></div>
);

// --- Sub-composants Helper ---
const Card: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-[4.5rem] border border-slate-100 p-12 md:p-16 shadow-sm space-y-12">
    <div className="flex items-center gap-6 border-b border-slate-50 pb-10"><div className="h-20 w-20 rounded-[2.2rem] bg-slate-900 text-white flex items-center justify-center text-4xl shadow-2xl">{icon}</div><h4 className="text-3xl font-black text-slate-900 tracking-tighter">{title}</h4></div>
    <div>{children}</div>
  </div>
);
const FlowInput: React.FC<{ label: string; name: string; value: any; onChange: any; type?: string; required?: boolean; placeholder?: string; icon?: string; options?: {v:string, l:string}[] }> = ({ label, name, value, onChange, type = 'text', required, placeholder, icon, options }) => (
  <div className="space-y-4">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">{label}</label>
    <div className="relative group/field">
      {icon && <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl opacity-10 group-focus-within/field:opacity-100 transition-all">{icon}</span>}
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} className={`w-full bg-slate-50 border-2 border-slate-100 ${icon ? 'pl-20' : 'px-10'} py-6 rounded-[2.2rem] outline-none focus:border-blue-500 font-black text-slate-800 transition-all appearance-none shadow-inner text-xl tracking-tight`}>
          {options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className={`w-full bg-slate-50 border-2 border-slate-100 ${icon ? 'pl-20' : 'px-10'} py-6 rounded-[2.2rem] outline-none focus:border-blue-500 transition-all font-black text-slate-800 shadow-inner text-xl tracking-tight`} />
      )}
      {type === 'select' && <span className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">▼</span>}
    </div>
  </div>
);