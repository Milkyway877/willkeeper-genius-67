
import React, { useEffect, useState } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Heart, FileText, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  altText: string;
}

const featureCards: FeatureCardProps[] = [
  {
    title: "Preserve Your Legacy",
    description: "Create lasting memories with your loved ones that span generations. Our secure platform ensures your wisdom, stories, and advice live on.",
    icon: <Heart className="h-5 w-5 text-blue-500" />,
    image: "public/lovable-uploads/6275a0df-cf03-49d4-8363-ec78fe85bb5d.png",
    altText: "Senior couple laughing together at the beach"
  },
  {
    title: "Future Family Moments",
    description: "Record special messages for milestones you might miss. Be present for graduations, weddings, and births with scheduled video and audio messages.",
    icon: <Clock className="h-5 w-5 text-blue-500" />,
    image: "public/lovable-uploads/182bc687-5086-431e-9013-bbdb17d4a31e.png",
    altText: "Family taking selfie together"
  },
  {
    title: "Professional Estate Planning",
    description: "Work with certified professionals to ensure your legacy is properly managed and your final wishes are respected according to legal standards.",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    image: "public/lovable-uploads/b9cfd3bc-eebb-4e46-a3ef-2272fa3debc9.png",
    altText: "Professional reading document with clients"
  },
  {
    title: "Family Trust Management",
    description: "Establish clear communication about your estate. Prevent misunderstandings and conflicts with properly documented intentions and wishes.",
    icon: <Shield className="h-5 w-5 text-blue-500" />,
    image: "public/lovable-uploads/79ec7735-f999-43b3-9a55-bd5b3c90edda.png",
    altText: "Meeting with estate planner"
  }
];

export function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoAdvance) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % featureCards.length);
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [autoAdvance]);

  const handleMouseEnter = () => {
    setAutoAdvance(false);
  };

  const handleMouseLeave = () => {
    setAutoAdvance(true);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Preserving What Matters Most</h2>
          <p className="text-lg text-gray-600">
            WillTank helps you create meaningful connections across time, ensuring your legacy lives on for generations to come.
          </p>
        </motion.div>
        
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="max-w-6xl mx-auto"
        >
          <Carousel className="w-full">
            <CarouselContent>
              {featureCards.map((feature, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-2">
                    <Card className="overflow-hidden border-blue-100 hover:shadow-md transition-all duration-300">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={feature.image} 
                          alt={feature.altText}
                          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-blue-50 p-2 rounded-full">
                            {feature.icon}
                          </div>
                          <h3 className="font-bold text-xl text-gray-900">{feature.title}</h3>
                        </div>
                        <p className="text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 bg-white/80" />
            <CarouselNext className="right-2 top-1/2 -translate-y-1/2 bg-white/80" />
          </Carousel>
          
          <div className="flex justify-center gap-1 mt-6">
            {featureCards.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === index ? "bg-blue-500 w-4" : "bg-gray-300"
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  setAutoAdvance(false);
                  setTimeout(() => setAutoAdvance(true), 10000);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
