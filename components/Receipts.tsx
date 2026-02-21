import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface Receipt {
  id: string;
  name: string;
  receipt_date: string;
  note?: string;
  created_at: string;
}

interface ReceiptsProps {
  lang: Language;
  showroom?: any;
  userId?: string;
}

const receiptPrintStyles = `
  @media print {
    body > * { display: none !important; }
    #receipt-print { display: block !important; }
  }
`;

export const Receipts: React.FC<ReceiptsProps> = ({ lang, showroom, userId }) => {
  const t = translations[lang];
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    receipt_date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.receipt_date) {
      alert('Name and date are required');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('receipts')
          .update({
            name: formData.name,
            receipt_date: formData.receipt_date,
            note: formData.note || null
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('receipts')
          .insert({
            name: formData.name,
            receipt_date: formData.receipt_date,
            note: formData.note || null
          });

        if (error) throw error;
      }

      setFormData({ name: '', receipt_date: new Date().toISOString().split('T')[0], note: '' });
      setShowForm(false);
      await fetchReceipts();
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error saving receipt: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEdit = (receipt: Receipt) => {
    setFormData({
      name: receipt.name,
      receipt_date: receipt.receipt_date,
      note: receipt.note || ''
    });
    setEditingId(receipt.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;

    try {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (error) throw error;
      await fetchReceipts();
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error deleting receipt');
    }
  };

  const handlePrint = (receipt: Receipt) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: white; }
          .receipt-container { width: 100%; max-width: 800px; margin: 0 auto; background: white; padding: 40px; }
          .header { display: flex; align-items: center; gap: 30px; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .logo { width: 100px; height: 100px; }
          .logo img { width: 100%; height: 100%; object-fit: contain; }
          .header-info h1 { font-size: 32px; font-weight: bold; color: #1f2937; margin: 0; }
          .header-info p { font-size: 14px; color: #666; margin: 5px 0 0 0; }
          .title { font-size: 14px; color: #999; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
          .document-id { font-size: 16px; font-weight: bold; color: #1f2937; margin: 8px 0 0 0; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 10px; border-bottom: 1px solid #f3f4f6; }
          .info-label { font-size: 13px; color: #666; font-weight: 600; }
          .info-value { font-size: 14px; color: #1f2937; font-weight: bold; }
          .note { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
          .note-label { font-size: 12px; color: #999; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
          .note-content { font-size: 13px; color: #1f2937; line-height: 1.5; }
          .signature-section { display: flex; gap: 60px; margin-top: 60px; }
          .signature-box { flex: 1; }
          .signature-label { font-size: 12px; color: #999; font-weight: bold; text-transform: uppercase; margin-bottom: 40px; }
          .signature-line { border-top: 1px solid #1f2937; padding-top: 5px; font-size: 12px; color: #1f2937; font-weight: bold; }
          .cachet-box { flex: 1; text-align: center; }
          .cachet-label { font-size: 12px; color: #999; font-weight: bold; text-transform: uppercase; margin-bottom: 40px; }
          .cachet-space { width: 120px; height: 80px; border: 2px dashed #d1d5db; border-radius: 8px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #d1d5db; font-size: 12px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; }
        </style>
      </head>
      <body>
        <div class="receipt-container" id="receipt-print">
          <div class="header">
            ${showroom?.logo_data ? `
              <div class="logo">
                <img src="${showroom.logo_data}" alt="Logo" />
              </div>
            ` : ''}
            <div class="header-info">
              <h1>${showroom?.name || 'SHOWROOM'}</h1>
              <p>${showroom?.slogan || ''}</p>
            </div>
            <div style="margin-left: auto; text-align: right;">
              <p class="title">REÇU</p>
              <p class="document-id">#${receipt.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📋 Informations Reçu</div>
            <div class="info-row">
              <span class="info-label">Nom:</span>
              <span class="info-value">${receipt.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date(receipt.receipt_date).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          ${receipt.note ? `
            <div class="note">
              <div class="note-label">📝 Note</div>
              <div class="note-content">${receipt.note}</div>
            </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-label">Signature</div>
              <div class="signature-line"></div>
            </div>
            <div class="cachet-box">
              <div class="cachet-label">Cachet/Sceau</div>
              <div class="cachet-space">Cachet</div>
            </div>
          </div>

          <div class="footer">
            <p>Reçu généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p>${showroom?.address || ''}</p>
          </div>
        </div>

        <script>
          // Inject print styles
          const style = document.createElement('style');
          style.innerHTML = \`
            @media print {
              body > * { display: none !important; }
              #receipt-print { display: block !important; }
            }
          \`;
          document.head.appendChild(style);

          // Print after a short delay
          setTimeout(() => {
            window.print();
            window.close();
          }, 100);
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900">📄 Reçus</h2>
          <p className="text-slate-400 font-bold text-xs uppercase mt-3">Gestion et Impression des Reçus</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', receipt_date: new Date().toISOString().split('T')[0], note: '' });
          }}
          className="custom-gradient-btn px-10 py-5 rounded-[2.5rem] text-white font-black text-sm"
        >
          ✚ Créer un Reçu
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            {editingId ? '✏️ Modifier Reçu' : '✚ Nouveau Reçu'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nom du Reçu *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold text-slate-900 placeholder-slate-400"
                placeholder="ex: Reçu Facture #001"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Date *</label>
              <input
                type="date"
                value={formData.receipt_date}
                onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Note (Optionnel)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold text-slate-900 placeholder-slate-400 resize-none"
              placeholder="Ajouter une note..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateOrUpdate}
              className="custom-gradient-btn px-8 py-3 rounded-2xl text-white font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all"
            >
              {editingId ? '💾 Mettre à Jour' : '✚ Créer'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', receipt_date: new Date().toISOString().split('T')[0], note: '' });
              }}
              className="px-8 py-3 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              ✕ Annuler
            </button>
          </div>
        </div>
      )}

      {/* Receipts Grid */}
      {loading ? (
        <div className="text-center py-20 animate-pulse font-black text-blue-500">CHARGEMENT DES REÇUS...</div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100">
          <p className="text-slate-400 font-black text-lg">📭 Aucun Reçu Créé</p>
          <p className="text-slate-500 text-sm mt-2">Cliquez sur "✚ Créer un Reçu" pour en ajouter un</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full"
            >
              {/* Receipt Header */}
              <div className="mb-4 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 truncate">{receipt.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                  📅 {new Date(receipt.receipt_date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Note Section */}
              {receipt.note && (
                <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-400 font-black uppercase tracking-widest mb-2">📝 Note</p>
                  <p className="text-sm text-slate-700 line-clamp-2">{receipt.note}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => handleEdit(receipt)}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white font-black text-xs rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest"
                >
                  ✏️ Éditer
                </button>
                <button
                  onClick={() => handlePrint(receipt)}
                  className="flex-1 px-4 py-3 bg-green-500 text-white font-black text-xs rounded-2xl hover:bg-green-600 transition-all uppercase tracking-widest"
                >
                  🖨️ Imprimer
                </button>
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-black text-xs rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
