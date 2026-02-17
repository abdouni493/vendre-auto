
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface AIAnalysisProps {
  lang: Language;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ lang }) => {
  const t = translations[lang];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const generateAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    setStatus('Collecte des données réelles...');

    try {
      // 1. Fetch all real data for context
      const [salesRes, purchasesRes, expensesRes, workersRes, transRes] = await Promise.all([
        supabase.from('sales').select('*'),
        supabase.from('purchases').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('workers').select('*'),
        supabase.from('worker_transactions').select('*')
      ]);

      setStatus('Analyse des flux financiers...');

      const sales = salesRes.data || [];
      const purchases = purchasesRes.data || [];
      const expenses = expensesRes.data || [];
      const workers = workersRes.data || [];
      const transactions = transRes.data || [];

      // Calculate some quick aggregates to help the AI
      const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total_price), 0);
      const totalDebt = sales.reduce((acc, s) => acc + Number(s.balance), 0);
      const activeStockCount = purchases.filter(p => !p.is_sold).length;
      const stockValue = purchases.filter(p => !p.is_sold).reduce((acc, p) => acc + Number(p.sellingPrice), 0);
      const shopExpenses = expenses.reduce((acc, e) => acc + Number(e.cost), 0);
      const salariesPaid = transactions.filter(tr => tr.type === 'paiement').reduce((acc, tr) => acc + Number(tr.amount), 0);

      const businessData = {
        showroom: "AutoLux Algeria",
        metrics: {
          totalRevenue,
          totalDebt,
          activeStockCount,
          stockValue,
          shopExpenses,
          salariesPaid,
          employeeCount: workers.length
        },
        inventory_sample: purchases.slice(0, 10).map(p => ({
          make: p.make,
          model: p.model,
          year: p.year,
          cost: p.totalCost,
          price: p.sellingPrice,
          sold: p.is_sold
        })),
        recent_sales: sales.slice(0, 5).map(s => ({
          price: s.total_price,
          paid: s.amount_paid,
          date: s.created_at
        }))
      };

      setStatus('Génération du rapport stratégique...');

      // 2. Initialize Gemini AI
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const prompt = `Tu es le consultant IA expert d'AutoLux, un showroom de voitures de luxe en Algérie. 
      Analyse ces données RÉELLES de l'entreprise :
      ${JSON.stringify(businessData, null, 2)}

      Produis un rapport de haute direction (Executive Report) structuré ainsi :
      1. 📊 BILAN DE PERFORMANCE : Analyse le CA (${totalRevenue} DA) par rapport aux charges (${shopExpenses + salariesPaid} DA).
      2. 🏎️ STRATÉGIE DE STOCK : Analyse le stock actuel (${activeStockCount} véhicules, valeur ${stockValue} DA). Quels modèles privilégier selon le marché algérien actuel ?
      3. ⚠️ GESTION DES CRÉANCES : Analyse la dette client de ${totalDebt} DA. Propose une stratégie de recouvrement.
      4. 💡 CONSEILS & PRÉVISIONS : Donne 3 conseils concrets pour augmenter la marge nette de 15% le mois prochain.

      Utilise un ton professionnel, encourageant et très précis. Format Markdown avec émojis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAnalysis(response.text || "Erreur de génération.");
    } catch (err: any) {
      console.error(err);
      setAnalysis(`Désolé, une erreur est survenue : ${err.message}`);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Light Mode Premium Hero Section */}
      <div className="bg-white rounded-[4rem] p-12 md:p-20 text-slate-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-80 group-hover:bg-blue-100 transition-colors duration-1000"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-grow space-y-10 text-center md:text-left">
               <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
                  Analyse Temps Réel Connectée
               </div>
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-slate-900">
                  Votre Showroom <br/> sous <span className="text-blue-600">Intelligence Artificielle.</span>
               </h2>
               <p className="text-slate-500 text-xl font-medium max-w-xl leading-relaxed italic">
                 "AutoLux AI analyse vos ventes réelles et vos stocks pour transformer vos données en profits."
               </p>
               <button 
                 onClick={generateAnalysis}
                 disabled={loading}
                 className="custom-gradient-btn px-20 py-7 rounded-[3rem] text-white font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4 mx-auto md:mx-0"
               >
                 {loading ? (
                   <>
                     <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     {status}
                   </>
                 ) : (
                   <>🚀 Lancer l'Analyse Expert</>
                 )}
               </button>
            </div>
            <div className="flex-shrink-0 relative hidden lg:block">
               <div className="text-[12rem] animate-bounce duration-[3000ms] opacity-20">🤖</div>
               <div className="absolute inset-0 bg-blue-400/10 blur-[80px] rounded-full"></div>
            </div>
         </div>
      </div>

      {/* Analysis Result Display */}
      {analysis && (
        <div className="bg-white rounded-[4.5rem] border border-slate-100 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] p-12 md:p-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 relative overflow-hidden">
           {/* Decorative corner */}
           <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50/50 rounded-br-[4rem] border-r border-b border-blue-100/50 flex items-center justify-center text-3xl">✨</div>
           
           <div className="flex flex-col md:flex-row items-center justify-between mb-16 pb-10 border-b border-slate-50 gap-6">
              <div>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Rapport de Direction</h3>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Généré le {new Date().toLocaleDateString()} • IA AutoLux v3.0</p>
              </div>
              <button 
                onClick={() => window.print()} 
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
              >
                Imprimer Dossier Stratégique 🖨️
              </button>
           </div>
           
           <div className="prose prose-slate max-w-none">
              <div 
                className="whitespace-pre-wrap font-medium text-slate-700 text-lg leading-relaxed font-sans" 
                dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis) }}
              ></div>
           </div>

           <div className="mt-20 p-10 bg-blue-50/30 rounded-[3rem] border border-blue-100 border-dashed text-center">
              <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-4">Note de l'Expert IA</p>
              <p className="text-slate-500 italic text-sm">"Ce rapport est basé sur vos données d'exploitation réelles. Les conseils fournis sont des recommandations stratégiques automatiques destinées à aider votre prise de décision."</p>
           </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FeatureInfo emoji="📈" title="Analyse de Marge" desc="L'IA identifie vos modèles les plus rentables par marque." />
           <FeatureInfo emoji="🛡️" title="Sécurité Dette" desc="Algorithmes de détection des risques sur les créances clients." />
           <FeatureInfo emoji="💡" title="Conseils Locaux" desc="Stratégies adaptées spécifiquement au marché automobile Algérien." />
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

const FeatureInfo = ({ emoji, title, desc }: any) => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center space-y-4">
     <div className="text-4xl">{emoji}</div>
     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h4>
     <p className="text-slate-400 text-xs font-bold leading-relaxed">{desc}</p>
  </div>
);

// Formatteur Markdown amélioré pour un look professionnel
function formatMarkdown(text: string) {
  return text
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-black text-slate-900 mt-14 mb-8 tracking-tighter">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-blue-600 mt-12 mb-6 flex items-center gap-4"><span class="h-1.5 w-10 bg-blue-600 rounded-full"></span>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-black text-slate-800 mt-10 mb-4">$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-black text-slate-900 text-blue-900/80">$1</strong>')
    .replace(/^\* (.*$)/gim, '<li class="ml-8 list-none mb-3 flex items-start gap-3"><span class="text-blue-500 mt-1">✦</span><span class="font-medium">$1</span></li>')
    .replace(/\n/g, '<br/>');
}
