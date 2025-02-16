import { mkdir } from 'fs/promises';
import path from 'path';

export async function initializeUploadDirectories() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  
  try {
    await mkdir(uploadDir, { recursive: true });
    console.log('Upload directories initialized');
  } catch (error) {
    console.error('Failed to create upload directories:', error);
  }
} 