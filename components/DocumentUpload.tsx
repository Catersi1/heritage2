
import React, { useState } from 'react';
import { DocumentFile, Language } from '../types';
import { Icons, t } from '../constants';

interface Props {
  onSubmit: (docs: DocumentFile[], appointmentDate?: string | null) => void;
  onBack: () => void;
  onSaveAppointmentOnly?: (appointmentDate: string) => void;
  hasCosigner: boolean;
  language: Language;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DocumentUpload: React.FC<Props> = ({ onSubmit, onBack, onSaveAppointmentOnly, hasCosigner, language }) => {
  const strings = t(language);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<string>('');

  const categories: { key: DocumentFile['category']; label: string; sub: string }[] = [
    { key: 'bank_statement', label: strings.bankLabel, sub: strings.bankSub },
    { key: 'pay_stub', label: strings.payLabel, sub: strings.paySub },
    { key: 'license', label: strings.licenseLabel, sub: strings.licenseSub },
    { key: 'ss_card', label: strings.ssLabel, sub: strings.ssSub }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: DocumentFile['category'], owner: DocumentFile['owner']) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const oversized = Array.from(files).filter(f => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      alert(language === 'English'
        ? `The following file(s) exceed 10 MB and were not added: ${oversized.map(f => f.name).join(', ')}. Please use smaller files.`
        : `Los siguientes archivo(s) superan 10 MB y no se agregaron: ${oversized.map(f => f.name).join(', ')}. Use archivos más pequeños.`);
    }

    const validFiles = Array.from(files).filter(f => f.size <= MAX_FILE_SIZE_BYTES);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      const readFile = (file: File): Promise<DocumentFile> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: file.type,
              data: reader.result as string,
              category: category,
              owner: owner
            });
          };
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });
      };

      // Read all files in parallel
      const newDocs = await Promise.all(validFiles.map(readFile));
      
      setUploadedDocs(prev => [...prev, ...newDocs]);
    } catch (err) {
      console.error('File upload error:', err);
      alert(language === 'English' 
        ? 'Error uploading files. Please try again.' 
        : 'Error al cargar archivos. Por favor intente de nuevo.');
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const removeDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  const isComplete = () => {
    const applicantKeys = new Set(uploadedDocs.filter(d => d.owner === 'applicant').map(d => d.category));
    // Core categories needed
    const mainComplete = categories.every(cat => applicantKeys.has(cat.key));
    
    if (hasCosigner) {
      const cosignerKeys = new Set(uploadedDocs.filter(d => d.owner === 'cosigner').map(d => d.category));
      return mainComplete && categories.every(cat => cosignerKeys.has(cat.key));
    }
    
    return mainComplete;
  };

  const DocumentSection = ({ owner, title }: { owner: DocumentFile['owner'], title: string }) => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="text-xl font-black text-slate-800 border-l-4 border-blue-600 pl-4">{title}</h3>
        <span className="text-sm font-bold text-slate-600 bg-slate-200/80 px-3 py-1 rounded-full">{strings.fileSizeLimit}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={`${owner}-${cat.key}`} className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors group relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{cat.label}</h4>
                <p className="text-xs text-slate-500">{cat.sub}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1.5">{strings.fileSizeLimit}</p>
              </div>
              {uploadedDocs.some(d => d.category === cat.key && d.owner === owner) ? (
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  {strings.uploaded}
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  {strings.pending}
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {uploadedDocs.filter(d => d.category === cat.key && d.owner === owner).map(doc => (
                <div key={doc.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                  <span className="truncate max-w-[150px]">{doc.name}</span>
                  <button onClick={() => removeDoc(doc.id)} className="text-red-500 hover:text-red-700">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            <label className="block w-full">
              <p className="text-[11px] font-semibold text-slate-500 mb-2">{strings.fileSizeLimit}</p>
              <input type="file" multiple className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={(e) => handleFileUpload(e, cat.key, owner)} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Icons.Upload /> {strings.docTitle}
          </h2>
          <p className="text-slate-500 mt-1">{strings.docSubtitle}</p>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-2">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
      </div>

      <div className="p-8 space-y-12">
        <DocumentSection owner="applicant" title={language === 'English' ? 'Main Applicant Documents' : 'Documentos del Solicitante Principal'} />

        {hasCosigner && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-xl font-black text-slate-800 border-l-4 border-blue-600 pl-4">{strings.coBorrowerDocTitle}</h3>
              <span className="text-sm font-bold text-slate-600 bg-slate-200/80 px-3 py-1 rounded-full">{strings.fileSizeLimit}</span>
            </div>
            <p className="text-sm text-slate-500 pl-4 border-l-4 border-transparent">{strings.coBorrowerDocSub}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {categories.map((cat) => (
                <div key={`cosigner-${cat.key}`} className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors group relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{cat.label}</h4>
                      <p className="text-xs text-slate-500">{cat.sub}</p>
                      <p className="text-xs font-semibold text-slate-600 mt-1.5">{strings.fileSizeLimit}</p>
                    </div>
                    {uploadedDocs.some(d => d.category === cat.key && d.owner === 'cosigner') ? (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{strings.uploaded}</span>
                    ) : (
                      <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{strings.pending}</span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    {uploadedDocs.filter(d => d.category === cat.key && d.owner === 'cosigner').map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                        <span className="truncate max-w-[150px]">{doc.name}</span>
                        <button onClick={() => removeDoc(doc.id)} type="button" className="text-red-500 hover:text-red-700">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="block w-full">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">{strings.fileSizeLimit}</p>
                    <input type="file" multiple className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, cat.key, 'cosigner')} />
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="bg-blue-50 p-6 rounded-2xl flex items-center gap-4 text-blue-700 border border-blue-100">
          <i className="fa-solid fa-circle-info text-2xl"></i>
          <div>
            <p className="text-sm font-medium">{strings.docInfoNote}</p>
            <p className="text-xs font-semibold mt-2 opacity-90">{strings.fileSizeLimit}</p>
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-2xl flex items-center gap-4 text-emerald-800 border border-emerald-100">
          <i className="fa-solid fa-clock text-2xl"></i>
          <p className="text-sm font-medium font-semibold">{strings.docContactNote}</p>
        </div>

        <section className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50">
          <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
            <i className="fa-solid fa-calendar-days text-blue-600"></i> {strings.appointmentTitle}
          </h3>
          <p className="text-sm text-slate-500 mb-4">{strings.appointmentSub}</p>
          <div className="flex flex-wrap items-end gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 block mb-2">{strings.appointmentLabel}</span>
              <input
                type="date"
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </label>
            {onSaveAppointmentOnly && (
              <button
                type="button"
                onClick={() => {
                  if (!appointmentDate) {
                    alert(language === 'English' ? 'Please pick a date first.' : 'Por favor elija una fecha primero.');
                    return;
                  }
                  onSaveAppointmentOnly(appointmentDate);
                }}
                disabled={!appointmentDate}
                className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-calendar-check"></i> {strings.appointmentSubmitOnly}
              </button>
            )}
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button onClick={onBack} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all">
            {strings.back}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isUploading) return;
              if (isComplete()) {
                onSubmit(uploadedDocs, appointmentDate || null);
              } else {
                alert(language === 'English'
                  ? 'Please upload at least one document for each category above (bank statements, pay stub, ID, and Social Security card).'
                  : 'Por favor cargue al menos un documento por cada categoría (estados de cuenta, talón de pago, identificación y tarjeta de Seguro Social).');
              }
            }}
            disabled={isUploading}
            className={`flex-[2] font-black py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${isComplete() ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 hover:-translate-y-1' : 'bg-slate-200 text-slate-500 cursor-pointer hover:bg-slate-300'}`}
          >
            {isUploading ? (language === 'English' ? 'Uploading...' : 'Cargando...') : strings.submitFinal} <i className="fa-solid fa-check"></i>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm">{strings.lastStepNote}</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
