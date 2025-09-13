import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            eSahayak
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Buyer Lead Management System
          </p>
          <div className="space-x-4">
            <Link
              href="/buyers"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Leads
            </Link>
            <Link
              href="/buyers/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add New Lead
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
