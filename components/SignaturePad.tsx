
import React, { useState, useEffect } from 'react';

interface Props {
  onSave: (signatureText: string) => void;
  onClear: () => void;
  label: string;
  clearLabel: string;
  initialName?: string;
}

const SignaturePad: React.FC<Props> = ({ onSave, onClear, label, clearLabel, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const [selectedFont, setSelectedFont] = useState<number | null>(null);

  const fonts = [
    { name: 'Dancing Script', class: 'font-["Dancing_Script"]' },
    { name: 'Great Vibes', class: 'font-["Great_Vibes"]' },
    { name: 'Alex Brush', class: 'font-["Alex_Brush"]' },
    { name: 'Satisfy', class: 'font-["Satisfy"]' }
  ];

  useEffect(() => {
    if (initialName && !name) {
      setName(initialName);
    }
  }, [initialName]);

  const handleSelect = (index: number) => {
    setSelectedFont(index);
    if (name) {
      // We'll store the signature as a combination of text and font index or just the text
      // For simplicity in this app, we'll just pass the name and the font class
      onSave(`${name}|${fonts[index].class}`);
    }
  };

  const handleClear = () => {
    setName('');
    setSelectedFont(null);
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-slate-700 block">{label}</label>
        {(name || selectedFont !== null) && (
          <button 
            type="button" 
            onClick={handleClear}
            className="text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors"
          >
            {clearLabel}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Type your full name to sign"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (selectedFont !== null) {
              onSave(`${e.target.value}|${fonts[selectedFont].class}`);
            }
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fonts.map((font, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              className={`p-6 border-2 rounded-2xl text-left transition-all hover:border-blue-300 hover:bg-blue-50/30 ${
                selectedFont === index ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Style {index + 1}</p>
              <p className={`text-3xl ${font.class} text-slate-900 truncate`}>
                {name || 'Your Signature'}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {selectedFont !== null && name && (
        <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-2 text-green-700 text-xs font-bold animate-fade-in">
          <i className="fa-solid fa-circle-check"></i>
          <span>Signature Captured Successfully</span>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
