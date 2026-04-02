'use client'

import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="container-wrapper">
        <nav className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">OfferLoom</h1>
          </div>
          <ul className="flex gap-6 items-center">
            <li>
              <a href="/" className="text-gray-600 hover:text-primary transition">
                Home
              </a>
            </li>
            <li>
              <a href="/offers" className="text-gray-600 hover:text-primary transition">
                Offers
              </a>
            </li>
            <li>
              <a href="/dashboard" className="text-gray-600 hover:text-primary transition">
                Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
