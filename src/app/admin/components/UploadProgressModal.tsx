'use client';

import Modal from '@/app/admin/components/Modal';
import { useUploadStore } from '@/lib/data/store/uploadStore';

export default function UploadProgressModal() {
  // Use individual selectors to avoid object recreation and infinite loops
  const status = useUploadStore(state => state.status);
  const progress = useUploadStore(state => state.progress);
  const error = useUploadStore(state => state.error);
  const resetUpload = useUploadStore(state => state.resetUpload);

  const isUploading = status === 'uploading';
  const isError = status === 'error';

  if (!isUploading && !isError) {
    return null;
  }

  const handleClose = () => {
    if (isUploading) return;
    resetUpload();
  };

  return (
    <Modal
      isOpen={isUploading || isError}
      onClose={handleClose}
      title={isError ? 'Upload Failed' : 'Uploading Media'}
      showCloseButton={!isUploading}
      size="sm"
    >
      <div className="space-y-4">
        {isError ? (
          <p className="text-sm text-red-600">{error || 'Unable to upload file. Please try again.'}</p>
        ) : (
          <p className="text-sm text-gray-600">Please wait while we upload your media.</p>
        )}
        {!isError && (
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-200 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-right text-xs font-medium text-gray-600">
              {Math.min(progress, 100)}%
            </div>
          </div>
        )}
        {isError && (
          <p className="text-xs text-gray-500">Check your network and try uploading again.</p>
        )}
      </div>
    </Modal>
  );
}
