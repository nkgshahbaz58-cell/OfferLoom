import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - OfferLoom',
  description: 'Your personal dashboard',
}

export default function DashboardPage() {
  return (
    <div className="page-container">
      <div className="container-wrapper">
        <div className="page-header">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your account and offers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Metric {i}</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-center text-gray-600">Dashboard content will be displayed here. Coming soon...</p>
        </div>
      </div>
    </div>
  )
}
