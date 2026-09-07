import fs from 'fs';
import path from 'path';

export interface FileStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class LocalFileStorageService implements FileStorageService {
  private uploadDir = path.join(__dirname, '../../uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const uniqueName = `${Date.now()}-${fileName}`;
    const filePath = path.join(this.uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // Return a relative URL or path
    return `/uploads/${uniqueName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(this.uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

// Export a singleton instance of the chosen implementation
export const fileStorageService = new LocalFileStorageService();
