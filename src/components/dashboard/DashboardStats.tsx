
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Vault, Users, Shield, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, color = "blue" }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: string;
  color?: string;
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
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            <TrendingUp className="h-3 w-3 mr-1" />
            {change}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

export function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={FileText}
        title="Active Wills"
        value="3"
        change="+1"
        color="purple"
      />
      <StatCard
        icon={Vault}
        title="Messages in Tank"
        value="12"
        change="+2"
        color="blue"
      />
      <StatCard
        icon={Users}
        title="Trusted Contacts"
        value="5"
        color="green"
      />
      <StatCard
        icon={Shield}
        title="Security Score"
        value="98%"
        color="amber"
      />
    </div>
  );
}
