
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Briefcase, 
  Users, 
  Gift, 
  LockKeyhole,
  RotateCw
} from 'lucide-react';

type InfoCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, color }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[300px] w-full cursor-pointer perspective" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="h-full w-full duration-500 preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of card */}
        <div 
          className={`absolute inset-0 h-full w-full rounded-xl border backface-hidden p-6 shadow-lg flex flex-col items-center justify-center ${color}`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
          <div className="mt-auto">
            <button className="flex items-center text-sm text-white/80 hover:text-white transition-colors">
              <span className="mr-1">Learn more</span>
              <RotateCw size={14} />
            </button>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute inset-0 h-full w-full rounded-xl border backface-hidden p-6 shadow-lg flex flex-col ${color} rotate-y-180`}
        >
          <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>
          <p className="text-white/90 text-sm leading-relaxed">{description}</p>
          <div className="mt-auto flex justify-end">
            <button 
              className="flex items-center text-sm text-white/80 hover:text-white transition-colors"
              onClick={() => setIsFlipped(false)}
            >
              <span className="mr-1">Flip back</span>
              <RotateCw size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const InfoCards: React.FC = () => {
  const cards: InfoCardProps[] = [
    {
      title: "What is a Will?",
      description: "A will is a legal document that outlines how you want your assets distributed after your death. It allows you to name guardians for minor children, specify funeral arrangements, and appoint an executor to carry out your wishes. Without a will, state laws determine how your property is distributed, which may not align with your preferences.",
      icon: <FileText className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      title: "What is a Trust?",
      description: "A trust is a fiduciary arrangement that allows a third party (trustee) to hold and manage assets on behalf of beneficiaries. Trusts can provide tax benefits, protect assets from creditors, avoid probate, and ensure your estate is managed according to your wishes. Unlike wills, trusts can take effect during your lifetime and continue after death.",
      icon: <Briefcase className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-700"
    },
    {
      title: "Who are Beneficiaries?",
      description: "Beneficiaries are individuals or entities (like charities) you designate to receive assets from your estate or trust upon your death. They can inherit specific items, percentages of your estate, or receive benefits over time according to your instructions. Properly identifying beneficiaries ensures your assets go exactly where you intend.",
      icon: <Users className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-green-700"
    },
    {
      title: "Why Secure Your Will?",
      description: "Securing your will is crucial to prevent unauthorized access, tampering, or forgery. A compromised will can lead to family disputes, assets going to unintended recipients, or your final wishes being ignored. Modern digital encryption and verification systems ensure only designated individuals can access your will after your verified passing.",
      icon: <Shield className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-red-500 to-red-700"
    },
    {
      title: "Benefits of Estate Planning",
      description: "Comprehensive estate planning provides peace of mind, minimizes taxes, avoids probate delays, prevents family conflicts, and ensures your healthcare wishes are respected. It protects your loved ones from unnecessary financial and emotional stress during an already difficult time, and creates a lasting legacy that reflects your values and priorities.",
      icon: <Gift className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-amber-500 to-amber-700"
    },
    {
      title: "10-Way Security System",
      description: "WillTank's innovative 10-Way PIN system ensures unparalleled will security. After verified death confirmation, each beneficiary and executor receives a unique PIN. Your will remains protected until all PINs are correctly entered, preventing unauthorized access while ensuring legitimate beneficiaries receive their inheritance exactly as you intended.",
      icon: <LockKeyhole className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-gray-700 to-gray-900"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-100 to-transparent opacity-60"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-black">
            Understanding Estate Planning
          </h2>
          <p className="text-lg text-gray-600">
            Discover why proper estate planning and will security are essential for protecting your legacy and loved ones.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <InfoCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
