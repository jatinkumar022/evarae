import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Please select a file to upload' },
        { status: 400 }
      );
    }

    // Convert File → Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'categories' }, (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string });
          })
          .end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('[upload] Error:', error);
    return NextResponse.json(
      { error: 'Unable to upload file. Please try again' },
      { status: 500 }
    );
  }
}
