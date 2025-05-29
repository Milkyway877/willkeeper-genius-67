
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Vault, Users, Shield, ArrowRight } from 'lucide-react';

const QuickActionCard = ({ icon: Icon, title, description, href, color = "willtank" }: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color?: string;
}) => (
  <Link to={href} className="group">
    <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 border-l-4 border-l-transparent hover:border-l-willtank-500">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-willtank-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-willtank-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

export function DashboardActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <QuickActionCard
          icon={FileText}
          title="Create Will"
          description="Start creating a new will with our guided wizard"
          href="/will/create"
        />
        <QuickActionCard
          icon={Vault}
          title="Add Message to Tank"
          description="Schedule a future message for your loved ones"
          href="/tank/create"
        />
        <QuickActionCard
          icon={Users}
          title="Manage Contacts"
          description="Add or update your trusted contacts and beneficiaries"
          href="/tank?tab=verification"
        />
        <QuickActionCard
          icon={Shield}
          title="Security Settings"
          description="Review and update your account security"
          href="/settings"
        />
      </div>
    </div>
  );
}
