'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { getUploadUrl, getFileUrl } from '@/app/actions/storage';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
  label?: string;
  folder?: string;
}

export default function ImageUpload({ onUploadComplete, defaultImage, label = "Cover Image", folder = "community" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      // 1. Get pre-signed URL from server
      const { signedUrl, key } = await getUploadUrl(file.name, file.type, folder);

      // 2. Upload directly to Hugging Face Bucket
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // 3. Get the public URL
      const publicUrl = await getFileUrl(key);
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(defaultImage || '');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview('');
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
              <p className="text-xs text-secondary-text">PNG, JPG up to 10MB</p>
            </div>
          </>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-white" size={32} />
            <p className="text-white text-xs font-bold">Uploading to HF Bucket...</p>
          </div>
        )}
      </div>

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
