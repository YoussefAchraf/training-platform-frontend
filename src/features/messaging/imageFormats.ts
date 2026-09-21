const WEB_DISPLAYABLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
]);

export function isWebDisplayableImage(file: Blob): boolean {
  return WEB_DISPLAYABLE_IMAGE_TYPES.has(file.type.toLowerCase());
}

export function withJpegExtension(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '');
  return `${base || 'photo'}.jpg`;
}

export async function convertImageToJpeg(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) throw new Error('JPEG encoding failed');
    return new File([blob], withJpegExtension(file.name), { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

export async function prepareImageForSending(
  file: File,
  convert: (source: File) => Promise<File> = convertImageToJpeg,
): Promise<File | null> {
  if (isWebDisplayableImage(file)) return file;
  try {
    return await convert(file);
  } catch {
    return null;
  }
}
