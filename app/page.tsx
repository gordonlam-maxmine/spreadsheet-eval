'use client';
import Link from 'next/link';

export default function Home() {
  const libraries = [
    {
      name: 'Handsontable',
      url: '/handsontable',
      docs: 'https://handsontable.com/docs/react-data-grid'
    },
    // Add more libraries here as they're implemented
  ];

  return (
    <div className="container mx-auto px-4 py-8">      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libraries.map((library) => (
          <div key={library.name} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{library.name}</h2>
              <div className="flex flex-col gap-2">
                <Link 
                  href={library.url}
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center transition-colors"
                >
                  View Demo
                </Link>
                <a 
                  href={library.docs} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded text-center transition-colors"
                >
                  Their Documentation
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
 
    </div>
  );
}
