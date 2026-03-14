
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className={`${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm md:text-base`}>
        {type === 'success' && <i className="fa-solid fa-cloud-arrow-up"></i>}
        {type === 'error' && <i className="fa-solid fa-triangle-exclamation"></i>}
        {type === 'info' && <i className="fa-solid fa-circle-info"></i>}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
