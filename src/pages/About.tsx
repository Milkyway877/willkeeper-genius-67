
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award, Clock, Globe } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function About() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">About WillTank</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Simplifying estate planning with secure, innovative technology to ensure your legacy is preserved exactly as you intend.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-12 items-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  At WillTank, we're on a mission to democratize estate planning, making it accessible, simple, and secure for everyone regardless of their wealth or legal expertise.
                </p>
                <p className="text-gray-600">
                  We believe that planning for the future shouldn't be complicated, expensive, or emotionally draining. By combining cutting-edge technology with compassionate support, we've created a platform that transforms this crucial life task into a straightforward, even empowering experience.
                </p>
              </div>
              <div className="bg-willtank-50 rounded-xl p-8 border border-willtank-100">
                <h3 className="text-xl font-medium text-willtank-800 mb-4">Our Values</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-willtank-100">
                      <Users size={16} className="text-willtank-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Accessibility</h4>
                      <p className="text-sm text-gray-600">Making estate planning accessible to everyone, regardless of wealth or legal knowledge.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-willtank-100">
                      <Award size={16} className="text-willtank-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Excellence</h4>
                      <p className="text-sm text-gray-600">Committed to highest standards in security, technology, and customer support.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-willtank-100">
                      <Clock size={16} className="text-willtank-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Efficiency</h4>
                      <p className="text-sm text-gray-600">Saving our customers time and money with streamlined, intuitive processes.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-willtank-100">
                      <Globe size={16} className="text-willtank-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Innovation</h4>
                      <p className="text-sm text-gray-600">Continuously improving our platform with cutting-edge technology.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div 
              className="mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Our Story</h2>
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <p className="text-gray-600 mb-4">
                  WillTank was founded in 2020 by a team of legal experts, technologists, and individuals who had personally experienced the challenges of traditional estate planning. After witnessing family members struggle with complicated legal processes during already difficult times, our founders were inspired to create a better solution.
                </p>
                <p className="text-gray-600 mb-4">
                  By combining legal expertise with cutting-edge technology, we've built a platform that makes creating and managing wills and estate plans simple, secure, and accessible to everyone—not just the wealthy or legally savvy.
                </p>
                <p className="text-gray-600">
                  Today, WillTank serves thousands of clients worldwide, helping them secure their legacy and provide peace of mind for themselves and their loved ones. As we continue to grow, our commitment to innovation, security, and customer service remains unwavering.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Team</h2>
              <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                WillTank is powered by a diverse team of legal experts, software engineers, security specialists, and customer success professionals dedicated to revolutionizing estate planning.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Elizabeth Chen",
                    title: "CEO & Co-Founder",
                    bio: "Former estate attorney with 15+ years experience, passionate about making legal services accessible to all."
                  },
                  {
                    name: "Michael Rodriguez",
                    title: "CTO & Co-Founder",
                    bio: "Security expert and software architect with experience at major tech companies, focused on building secure, scalable systems."
                  },
                  {
                    name: "Sarah Johnson",
                    title: "Chief Legal Officer",
                    bio: "Estate planning specialist ensuring all WillTank documents meet legal requirements across multiple jurisdictions."
                  }
                ].map((member, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-willtank-600 mb-2">{member.title}</p>
                    <p className="text-sm text-gray-600">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
