import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Calendar, Award, ArrowRight, ExternalLink, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Community() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const forumCategories = [
    {
      title: "Getting Started",
      description: "New to WillTank? Introduce yourself and get help with the basics.",
      posts: 254,
      icon: <Users className="h-6 w-6 text-willtank-500" />
    },
    {
      title: "Estate Planning Tips",
      description: "Share advice and best practices for creating comprehensive estate plans.",
      posts: 186,
      icon: <ThumbsUp className="h-6 w-6 text-willtank-500" />
    },
    {
      title: "Technical Support",
      description: "Having issues with the platform? Get help from our community and team.",
      posts: 128,
      icon: <MessageSquare className="h-6 w-6 text-willtank-500" />
    },
    {
      title: "Feature Requests",
      description: "Suggest new features and vote on ideas from other community members.",
      posts: 97,
      icon: <Award className="h-6 w-6 text-willtank-500" />
    }
  ];

  const upcomingEvents = [
    {
      title: "Estate Planning Basics Webinar",
      date: "June 15, 2023",
      time: "2:00 PM - 3:30 PM EST",
      description: "Join our legal experts as they walk through the fundamentals of creating a solid estate plan.",
      link: "#"
    },
    {
      title: "Digital Assets & Your Will",
      date: "June 22, 2023",
      time: "1:00 PM - 2:00 PM EST",
      description: "Learn how to properly include cryptocurrency, online accounts, and other digital assets in your estate plan.",
      link: "#"
    },
    {
      title: "Q&A with Estate Attorneys",
      date: "July 5, 2023",
      time: "3:00 PM - 4:00 PM EST",
      description: "Get your estate planning questions answered by our panel of experienced attorneys.",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WillTank Community</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with fellow users, share estate planning insights, and learn from experts in our growing community.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <motion.div 
              className="lg:col-span-2"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900">Discussion Forums</h2>
                    <Button variant="outline" size="sm">
                      View All Topics
                    </Button>
                  </div>
                  <p className="text-gray-600">
                    Join the conversation with our community of estate planning enthusiasts and experts.
                  </p>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {forumCategories.map((category, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-willtank-50 rounded-lg">
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                              {category.posts} posts
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                          <Link to="#" className="text-willtank-600 text-sm font-medium flex items-center">
                            Explore topics <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">Ready to join the discussion?</h3>
                      <p className="text-sm text-gray-600">Sign up or log in to participate in the community.</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline">Log In</Button>
                      <Button>Sign Up</Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-willtank-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="mb-2">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar size={14} />
                          <span>{event.date}, {event.time}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      <Link to={event.link}>
                        <Button variant="outline" size="sm" className="w-full">Register</Button>
                      </Link>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <Link to="#" className="text-willtank-600 font-medium flex items-center justify-center">
                    View all events <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-willtank-50 rounded-xl p-6 border border-willtank-100">
                <h3 className="font-medium text-gray-900 mb-3">Join Our Newsletter</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Stay updated with community events, new features, and estate planning tips.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-willtank-500 focus:border-willtank-500"
                  />
                  <Button className="w-full">Subscribe</Button>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Community Resources</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Knowledge Base",
                  description: "Access our comprehensive library of articles, guides, and tutorials.",
                  icon: <ExternalLink className="h-5 w-5 text-willtank-500" />,
                  link: "#"
                },
                {
                  title: "Developer Hub",
                  description: "APIs, SDKs, and tools for developers building on the WillTank platform.",
                  icon: <ExternalLink className="h-5 w-5 text-willtank-500" />,
                  link: "#"
                },
                {
                  title: "Expert Directory",
                  description: "Connect with estate planning attorneys and financial advisors.",
                  icon: <ExternalLink className="h-5 w-5 text-willtank-500" />,
                  link: "#"
                }
              ].map((resource, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  <Link to={resource.link} className="text-willtank-600 font-medium flex items-center text-sm">
                    Learn more {resource.icon}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-willtank-600 to-willtank-800 rounded-xl shadow-lg overflow-hidden text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="p-6 md:p-8">
              <div className="md:flex items-center">
                <div className="mb-6 md:mb-0 md:mr-8 md:flex-1">
                  <h2 className="text-2xl font-semibold mb-2">Become a Community Ambassador</h2>
                  <p className="text-willtank-100">
                    Help others navigate their estate planning journey, share your expertise, and earn exclusive benefits.
                  </p>
                </div>
                <Button variant="secondary" className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border-none">
                  Apply Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-gray-200 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition">Security</Link></li>
                <li><Link to="/#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/documentation" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition">API</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition">Cookie Policy</Link></li>
                <li><Link to="/gdpr" className="text-gray-400 hover:text-white transition">GDPR</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <Logo color="white" />
            
            <div className="mt-6 md:mt-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} WillTank. All rights reserved.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <Link to="/social/facebook" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/twitter" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="/social/instagram" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/social/github" className="text-gray-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
