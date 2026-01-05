import SmartJotter from '@/components/smart-jotter/SmartJotter';

export default function JotterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Smart Jotter
              </h1>
              <p className="text-gray-600">
                Enter customer details and vehicle information for quick booking creation
              </p>
            </div>
            
            <SmartJotter />
          </div>
        </div>
      </div>
    </div>
  );
}