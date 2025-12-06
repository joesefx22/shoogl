export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export class ImageOptimizer {
  static optimizeUrl(
    url: string,
    options: ImageOptimizationOptions = {}
  ): string {
    // إذا كان URL لـ Cloudinary
    if (url.includes('cloudinary.com')) {
      return this.optimizeCloudinaryUrl(url, options);
    }

    // إذا كان URL لـ Uploadcare
    if (url.includes('ucarecdn.com')) {
      return this.optimizeUploadcareUrl(url, options);
    }

    // إذا كان URL محلي
    if (url.startsWith('/')) {
      return this.optimizeLocalUrl(url, options);
    }

    // استخدام next/image للصور الخارجية
    return url;
  }

  private static optimizeCloudinaryUrl(
    url: string,
    options: ImageOptimizationOptions
  ): string {
    const { width, height, quality = 80, format = 'webp', fit = 'cover' } = options;
    const parts = url.split('/upload/');
    
    if (parts.length !== 2) return url;

    const transformations = [];

    if (width || height) {
      transformations.push(`c_${fit}`);
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
    }

    transformations.push(`q_${quality}`, `f_${format}`);

    // تحسين الأداء
    transformations.push('fl_progressive', 'dpr_auto');

    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }

  private static optimizeLocalUrl(
    url: string,
    options: ImageOptimizationOptions
  ): string {
    // استخدام next/image للصور المحلية
    const { width, height, quality = 75 } = options;
    
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    params.append('format', 'webp');

    return `${url}?${params.toString()}`;
  }

  static getLazyLoadingSrcSet(
    url: string,
    sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
  ): string {
    return sizes
      .map(size => `${this.optimizeUrl(url, { width: size })} ${size}w`)
      .join(', ');
  }

  static getSizesAttribute(breakpoints?: Record<string, number>): string {
    const defaultBreakpoints = {
      '(max-width: 640px)': 100,
      '(max-width: 768px)': 50,
      '(max-width: 1024px)': 33.333,
      'default': 25,
    };

    const bp = breakpoints || defaultBreakpoints;
    
    return Object.entries(bp)
      .map(([query, width]) => 
        query === 'default' ? `${width}vw` : `${query} ${width}vw`
      )
      .join(', ');
  }
}
