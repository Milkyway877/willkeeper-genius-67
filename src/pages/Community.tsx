
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageSquare, LifeBuoy, FileQuestion, Calendar, Bookmark, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';

export default function Community() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const communityFeatures = [
    {
      title: "Discussion Forums",
      description: "Connect with other users to discuss estate planning topics, share experiences, and ask questions.",
      icon: <MessageSquare className="h-6 w-6 text-willtank-600" />,
      link: "/community/forums"
    },
    {
      title: "Expert Webinars",
      description: "Join live webinars with estate planning professionals, legal experts, and financial advisors.",
      icon: <Users className="h-6 w-6 text-willtank-600" />,
      link: "/community/webinars"
    },
    {
      title: "Resource Library",
      description: "Access guides, templates, and educational materials to help you navigate the estate planning process.",
      icon: <Bookmark className="h-6 w-6 text-willtank-600" />,
      link: "/community/resources"
    },
    {
      title: "Q&A Platform",
      description: "Get answers to your specific questions from our community of users and verified experts.",
      icon: <FileQuestion className="h-6 w-6 text-willtank-600" />,
      link: "/community/questions"
    },
    {
      title: "Support Groups",
      description: "Connect with others who are going through similar estate planning situations and challenges.",
      icon: <LifeBuoy className="h-6 w-6 text-willtank-600" />,
      link: "/community/groups"
    },
    {
      title: "Events Calendar",
      description: "Stay informed about upcoming community events, webinars, and meetups.",
      icon: <Calendar className="h-6 w-6 text-willtank-600" />,
      link: "/community/events"
    }
  ];

  const upcomingEvents = [
    {
      title: "Estate Planning 101 Webinar",
      date: "June 25, 2023",
      time: "2:00 PM EST",
      host: "Sarah Johnson, Estate Attorney",
      description: "An introduction to estate planning fundamentals for beginners.",
      registrationLink: "/community/events/estate-planning-101"
    },
    {
      title: "Digital Assets & Your Estate",
      date: "July 10, 2023",
      time: "1:00 PM EST",
      host: "Michael Rodriguez, Digital Security Expert",
      description: "Learn how to properly include digital assets in your estate plan.",
      registrationLink: "/community/events/digital-assets"
    },
    {
      title: "Ask Me Anything: Executor Responsibilities",
      date: "July 18, 2023",
      time: "3:00 PM EST",
      host: "Elizabeth Chen, WillTank CEO",
      description: "Open Q&A session about the roles and responsibilities of executors.",
      registrationLink: "/community/events/executor-ama"
    }
  ];

  const popularDiscussions = [
    {
      title: "How to talk to family members about your will",
      replies: 28,
      views: 342,
      lastActive: "2 hours ago",
      tags: ["Communication", "Family"]
    },
    {
      title: "Handling international assets in your estate plan",
      replies: 16,
      views: 189,
      lastActive: "1 day ago",
      tags: ["International", "Assets"]
    },
    {
      title: "Digital legacy: what happens to your online accounts?",
      replies: 32,
      views: 405,
      lastActive: "5 hours ago",
      tags: ["Digital", "Technology"]
    },
    {
      title: "Tax implications of different estate planning approaches",
      replies: 24,
      views: 276,
      lastActive: "3 days ago",
      tags: ["Taxes", "Financial"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">WillTank Community</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with other estate planners, share insights, and learn from experts in our supportive community.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button>Join the Community</Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Community Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Link to={feature.link} className="text-willtank-600 hover:text-willtank-700 font-medium inline-flex items-center">
                    Explore <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-10 mb-16">
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-willtank-500" />
                Upcoming Events
              </h2>
              
              <div className="space-y-6">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="mr-3">{event.date}</span>
                      <span>{event.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Host: {event.host}</p>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    <Link to={event.registrationLink}>
                      <Button size="sm">Register</Button>
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/community/events" className="text-willtank-600 hover:text-willtank-700 font-medium inline-flex items-center">
                  View All Events <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-willtank-500" />
                Popular Discussions
              </h2>
              
              <div className="space-y-4">
                {popularDiscussions.map((discussion, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 mb-2">{discussion.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {discussion.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-4">{discussion.replies} replies</span>
                      <span className="mr-4">{discussion.views} views</span>
                      <span>Last active: {discussion.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/community/forums" className="text-willtank-600 hover:text-willtank-700 font-medium inline-flex items-center">
                  Visit Forums <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="bg-gradient-to-br from-willtank-600 to-willtank-800 rounded-2xl p-8 text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="md:flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Join Our Community Today</h2>
                <p className="mb-4 md:mb-0 opacity-90 max-w-xl">
                  Connect with thousands of estate planners and experts. Get answers, share experiences, and make the estate planning process easier.
                </p>
              </div>
              <Button className="bg-white text-willtank-700 hover:bg-gray-100">
                Sign Up Now
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
