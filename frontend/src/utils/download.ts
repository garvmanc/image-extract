import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Photo } from '../types';
import { getPhotoUrl } from '../services/api';

export async function downloadSinglePhoto(photo: Photo, businessName: string, index: number): Promise<void> {
  const url = getPhotoUrl(photo.photoReference);
  const response = await fetch(url);
  const blob = await response.blob();
  const extension = blob.type.includes('png') ? 'png' : 'jpg';
  const filename = `${sanitizeFilename(businessName)}_photo_${index + 1}.${extension}`;
  saveAs(blob, filename);
}

export async function downloadAllPhotos(
  photos: Photo[],
  businessName: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(sanitizeFilename(businessName)) || zip;

  for (let i = 0; i < photos.length; i++) {
    onProgress?.(i + 1, photos.length);

    try {
      const url = getPhotoUrl(photos[i].photoReference);
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = blob.type.includes('png') ? 'png' : 'jpg';
      folder.file(`photo_${i + 1}.${extension}`, blob);
    } catch (error) {
      console.error(`Failed to download photo ${i + 1}:`, error);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${sanitizeFilename(businessName)}_photos.zip`);
}

export function exportMetadataCsv(photos: Photo[], businessName: string): void {
  const headers = ['Index', 'Width', 'Height', 'Photo Reference', 'Attributions'];
  const rows = photos.map((photo, i) => [
    i + 1,
    photo.width,
    photo.height,
    photo.photoReference,
    photo.htmlAttributions.join('; '),
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${sanitizeFilename(businessName)}_metadata.csv`);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
}
