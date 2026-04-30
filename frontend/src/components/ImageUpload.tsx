'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

export function ImageUpload({ value = [], onChange, max = 5, label = 'Ảnh' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch {
      return null;
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (value.length >= max) { setError(`Tối đa ${max} ảnh`); return; }
    setError('');
    setUploading(true);

    const remaining = max - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    const urls = await Promise.all(toUpload.map(uploadFile));
    const validUrls = urls.filter(Boolean) as string[];

    if (validUrls.length < toUpload.length) setError('Một số ảnh upload thất bại');
    onChange([...value, ...validUrls]);
    setUploading(false);
  }, [value, max, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-700 mb-2">{label}</label>}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {value.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
              <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button onClick={() => removeImage(idx)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center transition-opacity">
                  <X size={12} className="text-white" />
                </button>
              </div>
              {idx === 0 && (
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  Chính
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {value.length < max && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-violet-400 bg-violet-50'
              : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-violet-500 animate-spin" />
              <p className="text-sm text-violet-600 font-medium">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <Upload size={18} className="text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Kéo thả hoặc click để upload</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG tối đa 5MB · Còn {max - value.length} ảnh</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL input fallback */}
      <div className="mt-2">
        <p className="text-xs text-gray-400 mb-1">Hoặc nhập URL ảnh trực tiếp:</p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value.trim();
                if (url && value.length < max) {
                  onChange([...value, url]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <span className="text-xs text-gray-400 self-center">Enter để thêm</span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <X size={11} /> {error}
        </p>
      )}
    </div>
  );
}
