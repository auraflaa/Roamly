'use client';

import React, { useState } from 'react';
import { getUploadUrl } from '@/app/actions/storage';
import { Camera, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function BucketTest() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setError(null);

    try {
      // 1. Get pre-signed URL from server
      const { signedUrl, key } = await getUploadUrl(file.name, file.type);

      // 2. Upload directly to Hugging Face Bucket from browser
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // 3. Construct public URL
      const publicUrl = `https://huggingface.co/buckets/ourafla/Roamly/${key}`;
      setUploadedUrl(publicUrl);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div className="p-8 rounded-[28px] shadow-xl max-w-md mx-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-ember/10 flex items-center justify-center">
          <Camera className="text-brand-ember" size={20} />
        </div>
        <h2 className="text-xl font-bold text-primary-text">HF Bucket Test</h2>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="test-upload"
          />
          <label
            htmlFor="test-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl cursor-pointer hover:border-brand-ember hover:bg-brand-ember/5 transition-all group-hover:scale-[0.99]"
          >
            <Upload className="text-neutral-400 mb-2" size={24} />
            <span className="text-sm font-medium text-secondary-text">
              {file ? file.name : 'Select an image to test'}
            </span>
          </label>
        </div>

        {file && status !== 'success' && (
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            className="w-full py-4 rounded-xl bg-brand-ember text-white font-bold shadow-lg shadow-brand-ember/20 hover:bg-brand-sienna transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Verify Bucket Upload'
            )}
          </button>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Successfully uploaded!</p>
            </div>
            {uploadedUrl && (
              <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <img src={uploadedUrl} alt="Uploaded" className="w-full h-48 object-cover" />
              </div>
            )}
            <button
              onClick={() => {
                setFile(null);
                setStatus('idle');
                setUploadedUrl(null);
              }}
              className="w-full py-3 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
            >
              Upload another
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
