
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, BriefcaseBusiness, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';

export default function Careers() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const openPositions = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Remote (US/Canada)",
      type: "Full-time"
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time"
    },
    {
      title: "Estate Planning Specialist",
      department: "Legal",
      location: "New York, NY",
      type: "Full-time"
    },
    {
      title: "Customer Success Manager",
      department: "Customer Support",
      location: "Remote (US)",
      type: "Full-time"
    },
    {
      title: "Digital Marketing Specialist",
      department: "Marketing",
      location: "Remote (US/Canada)",
      type: "Full-time"
    }
  ];

  const benefits = [
    {
      title: "Competitive Compensation",
      description: "Salary packages that match or exceed industry standards, with equity options for all full-time employees."
    },
    {
      title: "Remote-First Culture",
      description: "Work from anywhere with flexible hours and quarterly team meetups in exciting locations."
    },
    {
      title: "Comprehensive Healthcare",
      description: "Full medical, dental, and vision coverage with options for dependents and wellness programs."
    },
    {
      title: "Professional Development",
      description: "Annual learning stipend, conference attendance, and dedicated time for professional growth."
    },
    {
      title: "Generous Time Off",
      description: "Unlimited PTO, paid holidays, parental leave, and sabbaticals after 3 years of service."
    },
    {
      title: "Work-Life Balance",
      description: "We encourage sustainable working hours and respect your personal time and well-being."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="text-center mb-16 max-w-3xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
              <p className="text-lg text-gray-600">
                Help us revolutionize estate planning and make a meaningful impact on people's lives. We're looking for passionate individuals who share our vision.
              </p>
            </motion.div>
            
            <motion.div 
              className="mb-20"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="aspect-video w-full bg-gray-200 rounded-xl mb-8"></div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-willtank-50 rounded-xl border border-willtank-100">
                  <div className="w-12 h-12 rounded-full bg-willtank-100 flex items-center justify-center mb-4">
                    <BriefcaseBusiness className="h-6 w-6 text-willtank-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                  <p className="text-gray-700">
                    We're democratizing estate planning, making it accessible to everyone through technology and innovation.
                  </p>
                </div>
                
                <div className="p-6 bg-willtank-50 rounded-xl border border-willtank-100">
                  <div className="w-12 h-12 rounded-full bg-willtank-100 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-willtank-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Our Values</h3>
                  <p className="text-gray-700">
                    We value trust, innovation, accessibility, and putting our customers at the center of everything we do.
                  </p>
                </div>
                
                <div className="p-6 bg-willtank-50 rounded-xl border border-willtank-100">
                  <div className="w-12 h-12 rounded-full bg-willtank-100 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-willtank-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Remote-First</h3>
                  <p className="text-gray-700">
                    We believe in hiring the best talent regardless of location, with team members across the globe.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="mb-20"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
              
              <div className="space-y-4">
                {openPositions.map((position, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <div className="md:flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {position.department}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <MapPin size={12} className="mr-1" /> {position.location}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <Button className="mt-4 md:mt-0">View & Apply</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Don't see a position that fits your skills?</p>
                <Button variant="outline">Submit General Application</Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Benefits & Perks</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className="text-willtank-500 mt-1 flex-shrink-0" size={18} />
                      <h3 className="text-lg font-medium text-gray-900">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-600 pl-7">{benefit.description}</p>
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
