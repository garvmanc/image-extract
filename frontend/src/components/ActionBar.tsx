import { useState } from 'react';
import { Photo } from '../types';
import { downloadAllPhotos, exportMetadataCsv } from '../utils/download';

interface ActionBarProps {
  photos: Photo[];
  businessName: string;
}

export function ActionBar({ photos, businessName }: ActionBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      await downloadAllPhotos(photos, businessName, (current, total) => {
        setProgress({ current, total });
      });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleExportCsv = () => {
    exportMetadataCsv(photos, businessName);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <button
        onClick={handleDownloadAll}
        disabled={downloading}
        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Downloading {progress.current}/{progress.total}...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All as ZIP
          </>
        )}
      </button>
      <button
        onClick={handleExportCsv}
        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>
    </div>
  );
}
