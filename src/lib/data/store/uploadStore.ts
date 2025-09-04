import { create } from 'zustand';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResponse {
  url: string;
  public_id: string;
}

interface UploadState {
  status: UploadStatus;
  fileUrl: string | null;
  publicId: string | null;
  error: string | null;

  // Actions
  uploadFile: (file: File) => Promise<void>;
  resetUpload: () => void;
}

export const useUploadStore = create<UploadState>(set => ({
  status: 'idle',
  fileUrl: null,
  publicId: null,
  error: null,

  uploadFile: async (file: File) => {
    set({ status: 'uploading', error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await res.json();

      set({
        fileUrl: data.url,
        publicId: data.public_id,
        status: 'success',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  resetUpload: () =>
    set({ status: 'idle', fileUrl: null, publicId: null, error: null }),
}));
