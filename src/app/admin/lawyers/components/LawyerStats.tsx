'use client';

import { Card } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LawyerStats() {
  const stats = [
    {
      title: 'Total Lawyers',
      value: '245',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Lawyers',
      value: '180',
      change: '+5%',
      trend: 'up',
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Pending Approval',
      value: '15',
      change: '-2%',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Suspended',
      value: '5',
      change: '0%',
      trend: 'neutral',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const metrics = [
    {
      title: 'Case Success Rate',
      value: '92%',
      icon: Scale,
      description: 'Average success rate across all cases'
    },
    {
      title: 'Faculty Retention',
      value: '95%',
      icon: GraduationCap,
      description: 'Retention rate for the past year'
    },
    {
      title: 'Average Workload',
      value: '24',
      icon: Briefcase,
      description: 'Cases per lawyer'
    },
    {
      title: 'Performance Score',
      value: '4.8/5',
      icon: TrendingUp,
      description: 'Average performance rating'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className={`text-sm mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-4 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary-100">
                  <metric.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{metric.title}</h4>
                  <p className="text-2xl font-bold text-primary-600 mt-1">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 