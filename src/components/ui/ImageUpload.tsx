'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2, X, Image as ImageIcon } from 'lucide-react';
import {
  COMMUNITY_IMAGE_LIMIT_BYTES,
  compressImageForFirestore,
  formatBytes,
} from '@/lib/firestore-images';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
  label?: string;
  maxBytes?: number;
  maxWidth?: number;
}

export default function ImageUpload({
  onUploadComplete,
  defaultImage,
  label = "Cover Image",
  maxBytes = COMMUNITY_IMAGE_LIMIT_BYTES,
  maxWidth = 900,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultImage || '');
  const [details, setDetails] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setDetails('Compressing for Firestore...');

    try {
      const result = await compressImageForFirestore(file, {
        maxBytes,
        maxWidth,
        maxHeight: maxWidth,
      });

      setPreview(result.dataUrl);
      setDetails(`Stored in Firestore (${formatBytes(result.byteSize)})`);
      onUploadComplete(result.dataUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to prepare image. Please try again.');
      setPreview(defaultImage || '');
      setDetails('');
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    setDetails('');
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-secondary-text uppercase tracking-widest px-1">{label}</label>
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 ${
          preview 
            ? 'border-transparent bg-elevated/5' 
            : 'border-border bg-elevated/5 hover:bg-elevated/10 hover:border-brand-ember/30'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-bold flex items-center gap-2">
                <Camera size={14} /> Change Image
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-brand-ember/10 flex items-center justify-center text-brand-ember">
              <ImageIcon size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-primary-text">Click to upload</p>
              <p className="text-xs text-secondary-text">Compressed into Firestore, max {formatBytes(maxBytes)}</p>
            </div>
          </>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-white" size={32} />
            <p className="text-white text-xs font-bold">Preparing image...</p>
          </div>
        )}
      </div>

      {details && (
        <p className="text-[11px] font-medium text-secondary-text px-1">{details}</p>
      )}

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
