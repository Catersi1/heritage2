
import React, { useState } from 'react';
import { DocumentFile, Language } from '../types';
import { Icons, t } from '../constants';

interface Props {
  onSubmit: (docs: DocumentFile[]) => void;
  onPartialUpdate?: (docs: DocumentFile[]) => void;
  onBack: () => void;
  hasCosigner: boolean;
  language: Language;
  initialDocs?: DocumentFile[];
}

const DocumentUpload: React.FC<Props> = ({ onSubmit, onPartialUpdate, onBack, hasCosigner, language, initialDocs = [] }) => {
  const strings = t(language);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentFile[]>(initialDocs);
  const [isUploading, setIsUploading] = useState(false);

  const categories: { key: DocumentFile['category']; label: string; sub: string }[] = [
    { key: 'bank_statement_1', label: language === 'English' ? 'Bank Statement (Month 1)' : 'Estado de Cuenta (Mes 1)', sub: strings.bankSub },
    { key: 'bank_statement_2', label: language === 'English' ? 'Bank Statement (Month 2)' : 'Estado de Cuenta (Mes 2)', sub: strings.bankSub },
    { key: 'bank_statement_3', label: language === 'English' ? 'Bank Statement (Month 3)' : 'Estado de Cuenta (Mes 3)', sub: strings.bankSub },
    { key: 'pay_stub', label: strings.payLabel, sub: strings.paySub },
    { key: 'license', label: strings.licenseLabel, sub: strings.licenseSub },
    { key: 'ss_card', label: strings.ssLabel, sub: strings.ssSub }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: DocumentFile['category'], owner: DocumentFile['owner']) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newDocs: DocumentFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(language === 'English' 
          ? `File "${file.name}" is too large. Maximum size is 10MB.` 
          : `El archivo "${file.name}" es demasiado grande. El tamaño máximo es 10MB.`);
        continue;
      }

      const reader = new FileReader();
      
      const filePromise = new Promise<DocumentFile>((resolve) => {
        reader.onload = () => {
          resolve({
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string,
            category: category,
            owner: owner
          });
        };
        reader.readAsDataURL(file);
      });

      const doc = await filePromise;
      newDocs.push(doc);
    }

    setUploadedDocs(prev => {
      const updated = [...prev, ...newDocs];
      if (onPartialUpdate) onPartialUpdate(updated);
      return updated;
    });
    setIsUploading(false);
  };

  const removeDoc = (id: string) => {
    setUploadedDocs(prev => {
      const updated = prev.filter(d => d.id !== id);
      if (onPartialUpdate) onPartialUpdate(updated);
      return updated;
    });
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

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const DocumentSection = ({ owner, title }: { owner: DocumentFile['owner'], title: string }) => (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-slate-800 border-l-4 border-blue-600 pl-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={`${owner}-${cat.key}`} className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors group relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{cat.label}</h4>
                <p className="text-xs text-slate-500">{cat.sub}</p>
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
                  <div className="flex flex-col min-w-0">
                    <span className="truncate max-w-[150px] font-bold">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">{formatSize(doc.size)}</span>
                  </div>
                  <button onClick={() => removeDoc(doc.id)} className="text-red-500 hover:text-red-700 p-1">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            <label className="block w-full">
              <input type="file" multiple className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={(e) => handleFileUpload(e, cat.key, owner)} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const handleFinalSubmitClick = () => {
    // We allow submission even if not all documents are uploaded as requested
    onSubmit(uploadedDocs);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Icons.Upload /> {strings.docTitle}
          </h2>
          <p className="text-slate-500 mt-1">{strings.docSubtitle}</p>
        </div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i> {strings.back}
        </button>
      </div>

      <div className="p-8 space-y-12">
        <DocumentSection owner="applicant" title={language === 'English' ? 'Main Applicant Documents' : 'Documentos del Solicitante Principal'} />
        
        {hasCosigner && (
          <DocumentSection owner="cosigner" title={language === 'English' ? 'Co-signer Documents' : 'Documentos del Co-fiador'} />
        )}

        <div className="bg-blue-50 p-6 rounded-2xl flex items-center gap-4 text-blue-700 border border-blue-100">
          <i className="fa-solid fa-circle-info text-2xl"></i>
          <p className="text-sm font-medium">{strings.docInfoNote}</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button onClick={onBack} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all">
            {strings.back}
          </button>
          <button onClick={handleFinalSubmitClick} disabled={isUploading}
            className={`flex-[2] font-black py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'}`}>
            {isUploading ? (language === 'English' ? 'Uploading...' : 'Cargando...') : strings.submitFinal} <i className="fa-solid fa-check"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
