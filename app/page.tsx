'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="layout-main">
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
          <div className="container-wrapper">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl font-bold mb-4">Welcome to OfferLoom</h2>
              <p className="text-xl mb-8">Manage your offers effortlessly with our modern platform</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="primary">
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-light">
          <div className="container-wrapper">
            <motion.h3
              className="text-3xl font-bold text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Features
            </motion.h3>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card
                  title="Easy Management"
                  description="Manage all your offers from one centralized platform"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card
                  title="Real-time Updates"
                  description="Stay updated with real-time notifications and changes"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card
                  title="Analytics Dashboard"
                  description="Get insights into your offer performance with detailed analytics"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container-wrapper">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-lg text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-lg mb-6">Join thousands of users managing their offers efficiently</p>
              <Button variant="outline" size="lg">
                Start Your Free Trial
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
