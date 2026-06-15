import { useState } from 'react';
import { UrlInput } from './components/UrlInput';
import { BusinessInfo } from './components/BusinessInfo';
import { PhotoGallery } from './components/PhotoGallery';
import { PhotoModal } from './components/PhotoModal';
import { ActionBar } from './components/ActionBar';
import { useExtractor } from './hooks/useExtractor';

function App() {
  const { loading, error, placeData, source, extract, reset } = useExtractor();
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Business Photo Extractor
            </h1>
            <p className="mt-2 text-gray-600">
              Extract business photos from Google Maps — powered by zero-cost caching
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* URL Input */}
        <div className="mb-8">
          <UrlInput onSubmit={extract} loading={loading} onReset={reset} />
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
            <p className="mt-4 text-gray-600">Extracting business photos...</p>
          </div>
        )}

        {/* Results */}
        {placeData && !loading && (
          <>
            <BusinessInfo data={placeData} source={source} />

            {placeData.photos.length > 0 && (
              <>
                <ActionBar photos={placeData.photos} businessName={placeData.name} />
                <PhotoGallery
                  photos={placeData.photos}
                  businessName={placeData.name}
                  onPhotoClick={setModalIndex}
                />
              </>
            )}

            {placeData.photos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg">No photos available for this business</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
        <p className="text-center text-sm text-gray-500">
          Business Photo Extractor — Zero-cost operation with aggressive caching
        </p>
      </footer>

      {/* Photo Modal */}
      {modalIndex !== null && placeData && (
        <PhotoModal
          photos={placeData.photos}
          currentIndex={modalIndex}
          businessName={placeData.name}
          onClose={() => setModalIndex(null)}
          onNavigate={setModalIndex}
        />
      )}
    </div>
  );
}

export default App;
