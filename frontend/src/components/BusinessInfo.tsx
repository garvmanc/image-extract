import { PlaceData } from '../types';

interface BusinessInfoProps {
  data: PlaceData;
  source: 'cache' | 'api' | null;
}

export function BusinessInfo({ data, source }: BusinessInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
          <p className="text-gray-600 mt-1">{data.formattedAddress}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {data.rating && (
              <span className="flex items-center gap-1 text-sm">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {data.rating} ({data.userRatingsTotal} reviews)
              </span>
            )}
            {data.phoneNumber && <span className="text-sm text-gray-500">{data.phoneNumber}</span>}
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Website
              </a>
            )}
          </div>
          {data.types.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.types.slice(0, 5).map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 capitalize"
                >
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {source && (
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                source === 'cache'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {source === 'cache' ? 'From Cache (Free)' : 'Fresh from API'}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {data.photos.length} photo{data.photos.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>
    </div>
  );
}
