import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Check, X, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface SignaturePadModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  initialSignature?: string;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

export default function SignaturePadModal({
  isOpen,
  title = 'Assinatura Digital do Cliente',
  subtitle = 'Peça para o cliente assinar diretamente na tela com o dedo ou caneta touch.',
  initialSignature,
  onClose,
  onSave
}: SignaturePadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<string>('#1e293b'); // slate-800 or blue
  const [penWidth, setPenWidth] = useState<number>(2.5);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // Set canvas internal resolution to match displayed size * devicePixelRatio for crisp lines
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;

        // If existing signature passed and user hasn't drawn yet
        if (initialSignature && !hasDrawn) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            setHasDrawn(true);
          };
          img.src = initialSignature;
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      // Prevent scrolling on touch
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert('Por favor, faça a assinatura antes de confirmar.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="signature-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
        id="signature-modal-container"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PenTool size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Body */}
        <div className="p-4 sm:p-5 bg-slate-50 flex flex-col items-center">
          <div className="w-full relative bg-white border-2 border-dashed border-slate-300 rounded-xl overflow-hidden shadow-inner touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 sm:h-56 cursor-crosshair block"
            />
            {/* Guide line for signature */}
            <div className="absolute bottom-8 left-8 right-8 border-b border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-300 font-mono select-none">
              <span>✕ Assine sobre esta linha</span>
              <span>Clima Frio</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Cor:</span>
              <button
                type="button"
                onClick={() => setPenColor('#1e293b')}
                className={`w-6 h-6 rounded-full bg-slate-800 border-2 transition ${penColor === '#1e293b' ? 'border-blue-500 scale-110 shadow-xs' : 'border-transparent'}`}
                title="Tinta Preta / Grafite"
              />
              <button
                type="button"
                onClick={() => setPenColor('#1d4ed8')}
                className={`w-6 h-6 rounded-full bg-blue-700 border-2 transition ${penColor === '#1d4ed8' ? 'border-blue-500 scale-110 shadow-xs' : 'border-transparent'}`}
                title="Tinta Azul Caneta"
              />
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
            >
              <RotateCcw size={14} />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={16} />
            <span>Confirmar e Salvar Assinatura</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
