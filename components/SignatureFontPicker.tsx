
import React, { useState, useEffect } from 'react';

const SIGNATURE_FONTS = [
  { id: 'dancing', name: 'Dancing Script', fontFamily: '"Dancing Script", cursive' },
  { id: 'greatvibes', name: 'Great Vibes', fontFamily: '"Great Vibes", cursive' },
  { id: 'pacifico', name: 'Pacifico', fontFamily: '"Pacifico", cursive' },
  { id: 'allura', name: 'Allura', fontFamily: '"Allura", cursive' }
] as const;

interface Props {
  initialName?: string;
  /** When provided, shows as already selected so the user doesn't have to click "Use this signature" again */
  initialSignature?: string;
  onSave: (signatureDataUrl: string) => void;
  onClear: () => void;
  label: string;
  clearLabel: string;
  hintText?: string;
  useButtonText?: string;
  signatureHeading?: string;  // e.g. "Type your name and choose a style"
}

const SignatureFontPicker: React.FC<Props> = ({ initialName = '', initialSignature, onSave, onClear, label, clearLabel, hintText = 'Choose a style and enter your full name. Then click "Use this signature".', useButtonText = 'Use this signature', signatureHeading }) => {
  const [name, setName] = useState(initialName);
  const [selectedFont, setSelectedFont] = useState<typeof SIGNATURE_FONTS[number]>(SIGNATURE_FONTS[0]);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  useEffect(() => {
    setName(prev => prev || initialName);
  }, [initialName]);

  useEffect(() => {
    setHasSignature(!!initialSignature);
  }, [initialSignature]);

  const generateSignatureImage = (): string | null => {
    const text = (name || '').trim();
    if (!text) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    const w = 500;
    const h = 120;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 42px ${selectedFont.fontFamily}`;
    ctx.fillText(text, w / 2, h / 2);

    return canvas.toDataURL('image/png');
  };

  const handleUseSignature = () => {
    const dataUrl = generateSignatureImage();
    if (dataUrl) {
      onSave(dataUrl);
      setHasSignature(true);
    }
  };

  const handleClear = () => {
    setHasSignature(false);
    onClear();
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
      {signatureHeading && (
        <p className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
          {signatureHeading}
        </p>
      )}
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-slate-700 block">{label}</label>
        {hasSignature && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors"
          >
            {clearLabel}
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">
          {hintText}
        </p>
        <input
          type="text"
          placeholder="Type your full name here"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SIGNATURE_FONTS.map(font => (
          <button
            key={font.id}
            type="button"
            onClick={() => setSelectedFont(font)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedFont.id === font.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{font.name}</p>
            <p
              className="text-xl text-slate-800 truncate"
              style={{ fontFamily: font.fontFamily }}
            >
              {name || 'Your name'}
            </p>
          </button>
        ))}
      </div>

      {!hasSignature ? (
        <button
          type="button"
          onClick={handleUseSignature}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl font-bold border-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {useButtonText}
        </button>
      ) : (
        <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50 flex items-center gap-3">
          {initialSignature ? (
            <img src={initialSignature} alt="Your signature" className="h-12 object-contain" />
          ) : (
            <span className="text-green-600 text-2xl" style={{ fontFamily: selectedFont.fontFamily }}>
              {(name || '').trim()}
            </span>
          )}
          <span className="text-xs font-bold text-green-700 uppercase">Selected</span>
        </div>
      )}
    </div>
  );
};

export default SignatureFontPicker;
