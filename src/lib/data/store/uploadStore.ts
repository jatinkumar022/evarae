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
  progress: number;

  // Actions
  uploadFile: (file: File) => Promise<void>;
  resetUpload: () => void;
}

export const useUploadStore = create<UploadState>(set => ({
  status: 'idle',
  fileUrl: null,
  publicId: null,
  error: null,
  progress: 0,

  uploadFile: async (file: File) => {
    set({ status: 'uploading', error: null, progress: 0, fileUrl: null, publicId: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await new Promise<UploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');

        xhr.upload.onprogress = event => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            set({ progress: percent });
          }
        };

        xhr.onerror = () => {
          reject(new Error('Upload failed')); 
        };
        xhr.ontimeout = () => {
          reject(new Error('Upload timed out'));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText) as UploadResponse;
              resolve(json);
            } catch (err) {
              reject(err instanceof Error ? err : new Error('Invalid upload response'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.send(formData);
      });

      set({
        fileUrl: response.url,
        publicId: response.public_id,
        status: 'success',
        progress: 100,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      set({
        error: message,
        status: 'error',
        progress: 0,
      });
    }
  },

  resetUpload: () =>
    set({ status: 'idle', fileUrl: null, publicId: null, error: null, progress: 0 }),
}));
