
import React, { useState, useRef, useEffect } from 'react';
import { InvoiceTemplate, Language, InvoiceDesign, ElementPosition } from '../types';
import { translations } from '../translations';

interface PersonalizationProps {
  lang: Language;
}

const defaultDesign: InvoiceDesign = {
  logoPosition: { x: 0, y: 0 },
  titlePosition: { x: 0, y: 0 },
  clientInfoPosition: { x: 0, y: 0 },
  carInfoPosition: { x: 0, y: 0 },
  financialsPosition: { x: 0, y: 0 },
  extraTexts: [],
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  fontSizeBase: 14,
  headerPadding: 40,
  showChecklist: false,
  labels: {
    title: 'FACTURE DE VENTE',
    total: 'MONTANT TOTAL',
    date: 'DATE D\'ÉMISSION',
    ref: 'RÉFÉRENCE',
    safetyTitle: 'Contrôle Sécurité',
    equipmentTitle: 'Équipements Obligatoires',
    comfortTitle: 'Confort & État',
    partnerLabel: 'Partenaire / Client',
    carLabel: 'Véhicule Concerné'
  }
};

type EditableField = 'logo' | 'title' | 'general' | 'labels' | 'safety' | 'equipment' | 'comfort' | 'none';

export const Personalization: React.FC<PersonalizationProps> = ({ lang }) => {
  const t = translations[lang];
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([
    { id: '1', name: 'Facture Vente Gold', type: 'sale', design: defaultDesign },
    { id: '2', name: 'Check-in Technique', type: 'checkin', design: { ...defaultDesign, showChecklist: true, primaryColor: '#10b981', labels: { ...defaultDesign.labels, title: 'RAPPORT D\'ENTRÉE' } } },
  ]);

  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [selectedField, setSelectedField] = useState<EditableField>('none');

  const handleUpdateDesign = (field: keyof InvoiceDesign, value: any) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      design: { ...editingTemplate.design, [field]: value }
    });
  };

  const handleUpdateLabel = (labelKey: keyof InvoiceDesign['labels'], value: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      design: {
        ...editingTemplate.design,
        labels: { ...editingTemplate.design.labels, [labelKey]: value }
      }
    });
  };

  const handleUpdatePosition = (field: 'logoPosition' | 'titlePosition', axis: 'x' | 'y', value: number) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      design: {
        ...editingTemplate.design,
        [field]: { ...editingTemplate.design[field], [axis]: value }
      }
    });
  };

  const saveDesign = () => {
    if (!editingTemplate) return;
    setTemplates(prev => {
      const exists = prev.find(tpl => tpl.id === editingTemplate.id);
      if (exists) return prev.map(tpl => tpl.id === editingTemplate.id ? editingTemplate : tpl);
      return [...prev, editingTemplate];
    });
    setEditingTemplate(null);
    setSelectedField('none');
  };

  return (
    <div className="h-full bg-[#f8fafc] rounded-[3rem] overflow-hidden">
      {!editingTemplate ? (
        <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Studio de Design</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-3">Créez l'identité visuelle de votre showroom</p>
            </div>
            <button 
              onClick={() => setEditingTemplate({ id: Date.now().toString(), name: 'Nouveau Modèle', type: 'sale', design: defaultDesign })}
              className="custom-gradient-btn px-10 py-5 rounded-[2rem] text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
            >
              Nouveau Design +
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {templates.map(tpl => (
              <div key={tpl.id} className="group bg-white rounded-[4rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col">
                <div className="aspect-[3/4] rounded-[2.5rem] bg-slate-50 border border-slate-100 mb-8 overflow-hidden relative">
                   <div className="absolute inset-0 scale-[0.35] origin-top-left w-[285%] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                      <InvoicePreview design={tpl.design} type={tpl.type} isMini />
                   </div>
                   <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-blue-600/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button onClick={() => setEditingTemplate(tpl)} className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Editer le Dossier</button>
                   </div>
                </div>
                <div className="flex justify-between items-center px-4">
                   <div>
                      <h3 className="text-xl font-black text-slate-900">{tpl.name}</h3>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{tpl.type}</p>
                   </div>
                   <button onClick={() => setTemplates(prev => prev.filter(t => t.id !== tpl.id))} className="h-10 w-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-140px)] animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
          {/* LEFT: INTERACTIVE CANVAS AREA */}
          <div className="flex-grow bg-[#e2e8f0] p-12 md:p-16 overflow-y-auto flex justify-center custom-scrollbar relative">
             <div className="absolute top-8 left-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setEditingTemplate(null)} className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">←</button>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                     <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                     Cliquer sur un élément pour l'éditer
                  </span>
                </div>
             </div>

             <div className="absolute top-8 right-10 flex gap-4">
                <button onClick={saveDesign} className="px-10 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white shadow-xl transition-all">Sauvegarder le Modèle</button>
             </div>
             
             {/* THE PAPER (A4 ASPECT RATIO) */}
             <div className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] w-full max-w-[800px] min-h-[1131px] transition-all duration-700 origin-top h-fit mb-40 overflow-hidden">
                <InvoicePreview 
                  design={editingTemplate.design} 
                  type={editingTemplate.type} 
                  selectedField={selectedField}
                  onSelectField={setSelectedField}
                />
             </div>
          </div>

          {/* RIGHT: CONTEXTUAL INSPECTOR PANEL */}
          <div className="w-[420px] bg-white border-l border-slate-100 flex flex-col shadow-2xl z-20 overflow-hidden animate-in slide-in-from-right-full duration-500">
             <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-lg">🛠️</div>
                <div>
                   <h3 className="font-black text-slate-900 tracking-tight text-lg">Inspecteur Studio</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration de l'élément</p>
                </div>
             </div>

             <div className="flex-grow overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {selectedField === 'none' && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                    <span className="text-7xl">🖱️</span>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Sélectionnez un élément <br/> sur la facture pour <br/> voir ses propriétés.
                    </p>
                  </div>
                )}

                {selectedField === 'logo' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <InspectorGroup title="Position du Logo" icon="🖼️">
                       <InspectorPosition 
                         value={editingTemplate.design.logoPosition} 
                         onChangeX={(v) => handleUpdatePosition('logoPosition', 'x', v)}
                         onChangeY={(v) => handleUpdatePosition('logoPosition', 'y', v)}
                       />
                    </InspectorGroup>
                    <InspectorGroup title="Espacement Global" icon="📐">
                       <InspectorRange label="Marge Haute" value={editingTemplate.design.headerPadding} min={10} max={150} onChange={(v) => handleUpdateDesign('headerPadding', v)} />
                    </InspectorGroup>
                  </div>
                )}

                {selectedField === 'title' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <InspectorGroup title="Édition du Titre" icon="🖋️">
                       <InspectorText label="Texte Principal" value={editingTemplate.design.labels.title} onChange={(v) => handleUpdateLabel('title', v)} />
                       <InspectorPosition 
                         value={editingTemplate.design.titlePosition} 
                         onChangeX={(v) => handleUpdatePosition('titlePosition', 'x', v)}
                         onChangeY={(v) => handleUpdatePosition('titlePosition', 'y', v)}
                       />
                    </InspectorGroup>
                    <InspectorGroup title="Thème Visuel" icon="🎨">
                       <InspectorColor label="Couleur Titre" value={editingTemplate.design.primaryColor} onChange={(v) => handleUpdateDesign('primaryColor', v)} />
                       <InspectorRange label="Taille Police" value={editingTemplate.design.fontSizeBase + 10} min={18} max={60} onChange={(v) => handleUpdateDesign('fontSizeBase', v - 10)} />
                    </InspectorGroup>
                  </div>
                )}

                {selectedField === 'labels' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <InspectorGroup title="Libellés Statiques" icon="✍️">
                       <InspectorText label="Date" value={editingTemplate.design.labels.date} onChange={(v) => handleUpdateLabel('date', v)} />
                       <InspectorText label="Référence" value={editingTemplate.design.labels.ref} onChange={(v) => handleUpdateLabel('ref', v)} />
                       <InspectorText label="Client/Fournisseur" value={editingTemplate.design.labels.partnerLabel} onChange={(v) => handleUpdateLabel('partnerLabel', v)} />
                       <InspectorText label="Véhicule" value={editingTemplate.design.labels.carLabel} onChange={(v) => handleUpdateLabel('carLabel', v)} />
                       <InspectorText label="Somme Totale" value={editingTemplate.design.labels.total} onChange={(v) => handleUpdateLabel('total', v)} />
                    </InspectorGroup>
                  </div>
                )}

                {selectedField === 'safety' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <InspectorGroup title="Section Sécurité" icon="🛡️">
                       <InspectorText label="Titre de Section" value={editingTemplate.design.labels.safetyTitle} onChange={(v) => handleUpdateLabel('safetyTitle', v)} />
                       <InspectorToggle label="Afficher Checklist" active={editingTemplate.design.showChecklist} onToggle={() => handleUpdateDesign('showChecklist', !editingTemplate.design.showChecklist)} />
                    </InspectorGroup>
                  </div>
                )}

                {selectedField === 'equipment' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <InspectorGroup title="Équipements" icon="🧰">
                       <InspectorText label="Titre de Section" value={editingTemplate.design.labels.equipmentTitle} onChange={(v) => handleUpdateLabel('equipmentTitle', v)} />
                    </InspectorGroup>
                  </div>
                )}

                {selectedField === 'comfort' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <InspectorGroup title="Confort & État" icon="✨">
                       <InspectorText label="Titre de Section" value={editingTemplate.design.labels.comfortTitle} onChange={(v) => handleUpdateLabel('comfortTitle', v)} />
                    </InspectorGroup>
                  </div>
                )}
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">💡</div>
                   <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic uppercase tracking-wider">
                      Cliquez-glissez les sliders pour déplacer les éléments avec précision.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PREVIEW COMPONENTS ---

const InvoicePreview: React.FC<{ 
  design: InvoiceDesign; 
  type: string; 
  isMini?: boolean;
  selectedField?: EditableField;
  onSelectField?: (field: EditableField) => void;
}> = ({ design, type, isMini, selectedField, onSelectField }) => {
  
  const selectableClass = (field: EditableField) => `
    relative transition-all duration-300 cursor-pointer rounded-xl
    ${selectedField === field ? 'ring-4 ring-blue-500 ring-offset-8 scale-[1.02] shadow-2xl z-50' : 'hover:bg-slate-50/80'}
  `;

  return (
    <div style={{ fontSize: `${design.fontSizeBase}px`, color: '#1e293b' }} className={`h-full flex flex-col font-sans ${isMini ? 'p-10' : 'p-20'}`}>
      
      {/* Header Section */}
      <div style={{ paddingBottom: `${design.headerPadding}px` }} className="relative flex flex-col items-center">
         
         {/* Logo */}
         <div 
           onClick={() => onSelectField?.('logo')}
           style={{ transform: `translate(${design.logoPosition.x}px, ${design.logoPosition.y}px)` }} 
           className={selectableClass('logo')}
         >
            <div className="w-32 h-32 bg-slate-100 rounded-3xl flex items-center justify-center text-6xl shadow-inner">⚡</div>
         </div>

         {/* Title Block */}
         <div 
           onClick={() => onSelectField?.('title')}
           style={{ transform: `translate(${design.titlePosition.x}px, ${design.titlePosition.y}px)` }} 
           className={`${selectableClass('title')} w-full text-center mt-10`}
         >
            <h1 style={{ color: design.primaryColor }} className="text-5xl font-black tracking-tighter leading-none mb-3 uppercase">{design.labels.title}</h1>
            <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs">AutoLux Premium Showroom Logistics & Services</p>
         </div>

         <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50">
            <div style={{ backgroundColor: design.primaryColor }} className="h-full w-1/4"></div>
         </div>
      </div>

      {/* Metadata Block */}
      <div 
        onClick={() => onSelectField?.('labels')}
        className={`${selectableClass('labels')} grid grid-cols-2 gap-20 my-20 p-6`}
      >
         <div className="space-y-6">
            <div className="space-y-2">
               <p style={{ color: design.secondaryColor }} className="text-[10px] font-black uppercase tracking-widest">{design.labels.ref}</p>
               <p className="font-black text-2xl tracking-tighter">#LUX-2024-001-A</p>
            </div>
            <div className="space-y-2">
               <p style={{ color: design.secondaryColor }} className="text-[10px] font-black uppercase tracking-widest">{design.labels.partnerLabel}</p>
               <p className="font-black text-xl text-slate-800">Mohamed Brahimi (Client Premium)</p>
            </div>
         </div>
         <div className="space-y-6 text-right">
            <div className="space-y-2">
               <p style={{ color: design.secondaryColor }} className="text-[10px] font-black uppercase tracking-widest">{design.labels.date}</p>
               <p className="font-black text-2xl tracking-tighter">26 Mars 2024</p>
            </div>
            <div className="space-y-2">
               <p style={{ color: design.secondaryColor }} className="text-[10px] font-black uppercase tracking-widest">{design.labels.carLabel}</p>
               <p className="font-black text-xl text-slate-800">Porsche 911 Carrera S (2024)</p>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow space-y-16">
         {design.showChecklist ? (
           <div className="space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-2 gap-12">
                 <div onClick={() => onSelectField?.('safety')} className={selectableClass('safety')}>
                    <ReportSection title={design.labels.safetyTitle} color={design.primaryColor}>
                       <CheckItem label="Feux et phares" />
                       <CheckItem label="Pneus (usure/pression)" />
                       <CheckItem label="Freins" />
                       <CheckItem label="Ceintures" />
                    </ReportSection>
                 </div>
                 <div onClick={() => onSelectField?.('equipment')} className={selectableClass('equipment')}>
                    <ReportSection title={design.labels.equipmentTitle} color={design.primaryColor}>
                       <CheckItem label="Roue de secours" />
                       <CheckItem label="Cric" />
                       <CheckItem label="Documents véhicule" />
                    </ReportSection>
                 </div>
              </div>
              <div onClick={() => onSelectField?.('comfort')} className={selectableClass('comfort')}>
                 <ReportSection title={design.labels.comfortTitle} color={design.primaryColor}>
                    <CheckItem label="Climatisation" />
                    <CheckItem label="État et propreté" />
                 </ReportSection>
              </div>
           </div>
         ) : (
           <div className="space-y-12 p-4">
              <div style={{ backgroundColor: design.primaryColor }} className="rounded-3xl p-6 flex text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                 <span className="flex-grow">Désignation du véhicule</span>
                 <span className="w-40 text-right">Montant Total</span>
              </div>
              <div className="p-8 border-b border-slate-100 flex items-center font-bold">
                 <span className="flex-grow">Porsche 911 Carrera S (2024) - Guards Red</span>
                 <span className="w-40 text-right font-black text-xl">31.000.000 DA</span>
              </div>
           </div>
         )}
      </div>

      {/* Footer Summary */}
      <div className="mt-20 border-t-4 pt-12 flex justify-between items-end" style={{ borderColor: design.primaryColor }}>
         <div className="flex flex-col gap-6">
            <div className="text-center p-8 border-2 border-slate-100 border-dashed rounded-[3rem] w-64 opacity-30">
               <p className="text-[8px] font-black uppercase tracking-widest mb-4">Cachet et Signature</p>
               <div className="h-16"></div>
            </div>
         </div>
         <div className="w-[400px] space-y-6 text-right">
            <div className="space-y-2">
               <p style={{ color: design.secondaryColor }} className="text-[11px] font-black uppercase tracking-widest">{design.labels.total}</p>
               <p style={{ color: design.primaryColor }} className="text-6xl font-black tracking-tighter">31.000.000 DA</p>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- INSPECTOR HELPERS ---

const InspectorGroup: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
     <div className="flex items-center gap-4 text-slate-900">
        <span className="text-3xl">{icon}</span>
        <h4 className="text-sm font-black uppercase tracking-[0.2em]">{title}</h4>
     </div>
     <div className="space-y-6">{children}</div>
  </div>
);

const InspectorRange: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-blue-600">{value}px</span>
     </div>
     <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" />
  </div>
);

const InspectorPosition: React.FC<{ value: ElementPosition; onChangeX: (v: number) => void; onChangeY: (v: number) => void }> = ({ value, onChangeX, onChangeY }) => (
  <div className="grid grid-cols-2 gap-6">
     <div className="space-y-3">
        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
           <span>Axe X</span>
           <span className="text-blue-600">{value.x}px</span>
        </div>
        <input type="range" min={-300} max={300} value={value.x} onChange={(e) => onChangeX(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" />
     </div>
     <div className="space-y-3">
        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
           <span>Axe Y</span>
           <span className="text-blue-600">{value.y}px</span>
        </div>
        <input type="range" min={-100} max={200} value={value.y} onChange={(e) => onChangeY(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" />
     </div>
  </div>
);

const InspectorColor: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-500/50 transition-colors">
     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono text-slate-400 font-bold">{value}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer overflow-hidden shadow-sm" />
     </div>
  </div>
);

const InspectorText: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
     <input 
       type="text" 
       value={value} 
       onChange={(e) => onChange(e.target.value)}
       className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl outline-none focus:border-blue-500 font-bold text-sm text-slate-800 transition-all shadow-inner"
     />
  </div>
);

const InspectorToggle: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <button onClick={onToggle} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all">
     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`h-4 w-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
     </div>
  </button>
);

const ReportSection: React.FC<{ title: string; color: string; children: React.ReactNode }> = ({ title, color, children }) => (
  <div className="space-y-6">
     <h4 style={{ color }} className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
        <span className="h-1 w-4 rounded-full bg-current"></span>
        {title}
     </h4>
     <div className="grid grid-cols-1 gap-3 px-2">
        {children}
     </div>
  </div>
);

const CheckItem: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50">
     <span className="text-xs font-bold text-slate-600 tracking-tight">{label}</span>
     <span className="text-green-500 font-black text-sm">✓</span>
  </div>
);