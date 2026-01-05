import Link from 'next/link';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  CurrencyPoundIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Bookings', href: '/autow/bookings', icon: CalendarIcon },
  { name: 'Invoices', href: '/autow/invoices', icon: ClipboardDocumentListIcon },
  { name: 'Estimates', href: '/autow/estimates', icon: CurrencyPoundIcon },
  { name: 'Jotter', href: '/autow/jotter', icon: PencilSquareIcon },
];

export default function AutowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/autow" className="text-xl font-bold text-gray-900">
                AUTOW Booking System
              </Link>
            </div>
            
            <nav className="flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}