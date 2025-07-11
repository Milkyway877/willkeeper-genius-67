
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Vault, Users, Shield, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, color = "blue", isLoading = false }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: string;
  color?: string;
  isLoading?: boolean;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
          </div>
        </div>
        {change && !isLoading && (
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            <TrendingUp className="h-3 w-3 mr-1" />
            {change}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  activeWills?: number;
  messagesInTank?: number;
  trustedContacts?: number;
  securityScore?: number;
  isLoading?: boolean;
}

export function DashboardStats({ 
  activeWills = 0, 
  messagesInTank = 0, 
  trustedContacts = 0, 
  securityScore = 0,
  isLoading = false 
}: DashboardStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={FileText}
        title="Active Wills"
        value={activeWills}
        color="purple"
        isLoading={isLoading}
      />
      <StatCard
        icon={Vault}
        title="Messages in Tank"
        value={messagesInTank}
        color="blue"
        isLoading={isLoading}
      />
      <StatCard
        icon={Users}
        title="Trusted Contacts"
        value={trustedContacts}
        color="green"
        isLoading={isLoading}
      />
      <StatCard
        icon={Shield}
        title="Security Score"
        value={isLoading ? "..." : `${securityScore}%`}
        color="amber"
        isLoading={isLoading}
      />
    </div>
  );
}
