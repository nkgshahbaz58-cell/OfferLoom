import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offers - OfferLoom',
  description: 'Browse and manage all your offers',
}

export default function OffersPage() {
  return (
    <div className="page-container">
      <div className="container-wrapper">
        <div className="page-header">
          <h1 className="text-4xl font-bold">Offers</h1>
          <p className="text-gray-600 mt-2">Manage and track all your offers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-center text-gray-600">Offers will be displayed here. Coming soon...</p>
        </div>
      </div>
    </div>
  )
}
