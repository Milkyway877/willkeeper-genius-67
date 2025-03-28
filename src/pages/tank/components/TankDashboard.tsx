
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CalendarClock, 
  Clock, 
  MessageSquare, 
  Video, 
  Mic, 
  FileText, 
  Plus, 
  Filter, 
  Search,
  Bell,
  CheckCircle,
  Clock4
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TankMessageCard } from './TankMessageCard';

// Define types to match what TankMessageCard expects
type MessageType = 'letter' | 'video' | 'audio' | 'document';
type MessageStatus = 'scheduled' | 'delivered';

type Message = {
  id: number;
  type: MessageType;
  title: string;
  recipient: string;
  deliveryDate: string;
  status: MessageStatus;
  preview: string;
};

// Sample data for demonstration
const demoMessages: Message[] = [
  {
    id: 1,
    type: 'letter',
    title: "Birthday Wishes for Emma",
    recipient: "Emma Johnson",
    deliveryDate: "2025-05-15",
    status: "scheduled",
    preview: "Dear Emma, As you celebrate your 30th birthday, I wanted to share some wisdom..."
  },
  {
    id: 2,
    type: 'video',
    title: "Wedding Anniversary Message",
    recipient: "James & Sarah",
    deliveryDate: "2024-08-22",
    status: "scheduled",
    preview: "A special video message for your 10th wedding anniversary"
  },
  {
    id: 3,
    type: 'audio',
    title: "Life Advice for My Children",
    recipient: "Alex & Madison",
    deliveryDate: "2030-01-01",
    status: "scheduled",
    preview: "Voice recording with advice and life lessons for my children"
  },
  {
    id: 4,
    type: 'document',
    title: "Family History Documents",
    recipient: "All Family Members",
    deliveryDate: "2026-12-25",
    status: "scheduled",
    preview: "Collection of family history documents and photographs"
  },
  {
    id: 5,
    type: 'letter',
    title: "Graduation Congratulations",
    recipient: "Thomas Williams",
    deliveryDate: "2023-06-15",
    status: "delivered",
    preview: "Dear Thomas, Congratulations on your graduation! I'm so proud of..."
  }
];

type TankDashboardProps = {
  onCreateNew: () => void;
};

export function TankDashboard({ onCreateNew }: TankDashboardProps) {
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMessages = messages.filter(message => {
    // Filter by type or status
    if (filter !== 'all' && message.type !== filter && message.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !message.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.recipient.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Stats for the dashboard
  const stats = {
    scheduled: messages.filter(m => m.status === 'scheduled').length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    letters: messages.filter(m => m.type === 'letter').length,
    videos: messages.filter(m => m.type === 'video').length,
    audios: messages.filter(m => m.type === 'audio').length,
    documents: messages.filter(m => m.type === 'document').length,
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CalendarClock className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold">{messages.length}</h3>
          <p className="text-gray-600 text-sm">Future Messages</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock4 className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <h3 className="text-2xl font-bold">{stats.scheduled}</h3>
          <p className="text-gray-600 text-sm">Scheduled for Delivery</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-gray-500">Completed</span>
          </div>
          <h3 className="text-2xl font-bold">{stats.delivered}</h3>
          <p className="text-gray-600 text-sm">Successfully Delivered</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Bell className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-sm text-gray-500">Next</span>
          </div>
          <h3 className="text-lg font-bold">Aug 22, 2024</h3>
          <p className="text-gray-600 text-sm">Next Scheduled Delivery</p>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search messages by title or recipient..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-willtank-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-willtank-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="letter">Letters</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
              <option value="scheduled">Scheduled</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <TankMessageCard key={message.id} message={message} />
          ))
        ) : (
          <div className="col-span-2 bg-gray-50 rounded-xl p-10 text-center">
            <div className="max-w-md mx-auto">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? "No messages match your current filters. Try adjusting your search or filter criteria."
                  : "You haven't created any future messages yet. Create your first message to get started."}
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
