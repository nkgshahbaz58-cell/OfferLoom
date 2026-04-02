'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  title: string
  description: string
  children?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <motion.div
      className="card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </motion.div>
  )
}
