
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, User, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';

export default function Blog() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const blogPosts = [
    {
      title: "Understanding Digital Assets in Your Estate Plan",
      excerpt: "Learn how to properly include digital assets like cryptocurrency, online accounts, and digital media in your estate plan.",
      author: "Elizabeth Chen",
      date: "June 15, 2023",
      readTime: "8 min read",
      category: "Digital Estate",
      slug: "digital-assets-estate-plan"
    },
    {
      title: "The Importance of Updating Your Will Regularly",
      excerpt: "Life changes constantly. Discover why and how often you should review and update your will to reflect your current situation.",
      author: "Sarah Johnson",
      date: "May 23, 2023",
      readTime: "6 min read",
      category: "Will Management",
      slug: "updating-will-regularly"
    },
    {
      title: "Choosing the Right Executor: What You Need to Know",
      excerpt: "Your executor plays a crucial role in managing your estate. Learn how to select the best person for this important responsibility.",
      author: "Michael Rodriguez",
      date: "April 10, 2023",
      readTime: "7 min read",
      category: "Executors",
      slug: "choosing-right-executor"
    },
    {
      title: "Estate Planning for Business Owners: Essential Steps",
      excerpt: "Business ownership adds complexity to estate planning. Discover the key considerations for protecting your business legacy.",
      author: "David Patel",
      date: "March 5, 2023",
      readTime: "10 min read",
      category: "Business Planning",
      slug: "estate-planning-business-owners"
    },
    {
      title: "How to Discuss Your Will with Family Members",
      excerpt: "Having open conversations about your will can prevent future conflicts. Learn effective strategies for these important discussions.",
      author: "Jennifer Kim",
      date: "February 18, 2023",
      readTime: "5 min read",
      category: "Family Discussions",
      slug: "discussing-will-family"
    },
    {
      title: "International Assets: Managing Property Across Borders",
      excerpt: "Owning assets in multiple countries presents unique estate planning challenges. Learn how to navigate international estate laws.",
      author: "Carlos Mendez",
      date: "January 22, 2023",
      readTime: "9 min read",
      category: "International Planning",
      slug: "international-assets-estate-planning"
    }
  ];

  const featuredPost = blogPosts[0];
  const regularPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WillTank Blog</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Expert insights and guidance on estate planning, will creation, and securing your legacy.
            </p>
          </motion.div>
          
          <motion.div 
            className="mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gray-200 h-64 md:h-auto"></div>
                <div className="p-6 md:p-8 md:w-1/2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-willtank-100 text-willtank-800">
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-gray-500">{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{featuredPost.author}</span>
                      <span className="text-gray-300 mx-1">•</span>
                      <CalendarDays size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{featuredPost.date}</span>
                    </div>
                    <Link to={`/blog/${featuredPost.slug}`}>
                      <Button variant="ghost" className="text-willtank-600">
                        Read More <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-gray-200 h-48"></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-willtank-50 text-willtank-800">
                        {post.category}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-600">{post.author}</span>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="sm" className="text-willtank-600 p-0 h-auto">
                          Read More <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <div className="mt-12 text-center">
            <Button variant="outline">Load More Articles</Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
