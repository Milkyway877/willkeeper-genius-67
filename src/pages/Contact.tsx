import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, MessageSquare, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthenticatedContactForm } from '@/components/contact/AuthenticatedContactForm';
import { Link } from 'react-router-dom';

export default function Contact() {
  const { user, loading } = useAuth();
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5 text-willtank-500" />,
      title: "Email Us",
      details: "support@willtank.com",
      description: "For general inquiries and support requests"
    },
    {
      icon: <Phone className="h-5 w-5 text-willtank-500" />,
      title: "Call Us",
      details: "+1 (888) 456-7890",
      description: "Monday to Friday, 9am to 5pm EST"
    },
    {
      icon: <MapPin className="h-5 w-5 text-willtank-500" />,
      title: "Visit Us",
      details: "123 Legal Avenue, Suite 400",
      description: "New York, NY 10001, USA"
    },
    {
      icon: <Clock className="h-5 w-5 text-willtank-500" />,
      title: "Hours",
      details: "Mon-Fri: 9am - 5pm EST",
      description: "Weekend support available for emergencies"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-willtank-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 md:py-20">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-willtank-50 px-3 py-1 text-sm font-medium text-willtank-700 mb-4">
              <MessageSquare size={14} />
              <span>Get In Touch</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our services? Our team is ready to assist you with any inquiries regarding estate planning and will management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {user ? (
                <AuthenticatedContactForm />
              ) : (
                <Card className="p-6 md:p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-willtank-100 rounded-full flex items-center justify-center mb-6">
                    <UserPlus className="h-8 w-8 text-willtank-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In to Contact Support</h2>
                  <p className="text-gray-600 mb-6">
                    Please sign in to your WillTank account to send us a message through our secure contact form.
                  </p>
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-willtank-500 hover:bg-willtank-600">
                      <Link to="/auth/signin">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth/signup">
                        Create Account
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">
                      Or contact us directly:
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <a href="mailto:support@willtank.com?subject=Support Request - WillTank">
                        <Mail className="mr-2 h-4 w-4" />
                        support@willtank.com
                      </a>
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-willtank-500 to-willtank-600 rounded-xl shadow-lg p-6 md:p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Customer Support Hours</h3>
                  <p className="mb-4">Our dedicated support team is available during the following hours to assist you with any questions or concerns:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-white" />
                      </div>
                      <span><strong>Weekdays:</strong> 9:00 AM - 8:00 PM EST</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-white" />
                      </div>
                      <span><strong>Weekends:</strong> 10:00 AM - 5:00 PM EST</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-white" />
                      </div>
                      <span><strong>Holidays:</strong> Limited availability (check our holiday schedule)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactInfo.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-willtank-600 font-medium">{item.details}</p>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="font-semibold mb-3 text-gray-900">Join Our Community</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect with other WillTank users, get tips, and stay updated on new features.
                  </p>
                  <Button asChild variant="outline" className="w-full border-willtank-500 text-willtank-500 hover:bg-willtank-50">
                    <a href="https://discord.gg/hGPgDqYP" target="_blank" rel="noopener noreferrer">
                      Join Discord Community
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Locations</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                WillTank maintains offices in major cities to serve our global client base.
              </p>
            </div>
            
            <div className="h-[400px] bg-gray-100 rounded-lg">
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Interactive map would be displayed here</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
