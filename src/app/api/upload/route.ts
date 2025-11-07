import cloudinary from '@/lib/cloudinary';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const MAX_FILE_SIZE_MB = Number(process.env.MAX_UPLOAD_MB || 8);
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'categories';

export const runtime = 'nodejs';

async function uploadToCloudinary(buffer: Buffer) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: UPLOAD_FOLDER }, (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Unknown upload error'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      })
      .end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return createErrorResponse('Please select a file to upload', 400);
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return createErrorResponse(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
        400
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer);

    return createNoCacheResponse({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('[upload] Error:', error);
    return createErrorResponse('Unable to upload file. Please try again', 500);
  }
}
