export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export class FileUtils {
  static async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      type?: 'image/jpeg' | 'image/webp' | 'image/png';
    } = {}
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (options.maxWidth && width > options.maxWidth) {
            height = (options.maxWidth / width) * height;
            width = options.maxWidth;
          }
          
          if (options.maxHeight && height > options.maxHeight) {
            width = (options.maxHeight / height) * width;
            height = options.maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const compressedFile = new File(
                [blob],
                file.name,
                {
                  type: options.type || file.type,
                  lastModified: Date.now(),
                }
              );
              
              resolve(compressedFile);
            },
            options.type || file.type,
            options.quality || 0.8
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  }

  static validateFile(file: File, options: FileUploadOptions = {}): string | null {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFiles = 1,
    } = options;

    if (file.size > maxSize) {
      return `حجم الملف أكبر من ${maxSize / 1024 / 1024}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return 'نوع الملف غير مسموح به';
    }

    return null;
  }

  static async readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  static async readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  static downloadFile(data: Blob | string, filename: string): void {
    const url = typeof data === 'string' ? data : URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (typeof data !== 'string') {
      URL.revokeObjectURL(url);
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^\w\s.-]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
}
