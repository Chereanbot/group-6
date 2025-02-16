import React from 'react';
import {
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineClipboardList,
  HiOutlineChartBar,
} from 'react-icons/hi';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-600">{title}</div>
        <div className="text-blue-500">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      {trend && (
        <div className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};

export const CoordinatorDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Coordinator Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Students"
          value="1,234"
          icon={<HiOutlineUserGroup className="w-6 h-6" />}
          trend={{ value: 5.2, isPositive: true }}
        />
        
        <DashboardCard
          title="Active Cases"
          value="42"
          icon={<HiOutlineScale className="w-6 h-6" />}
          trend={{ value: 2.1, isPositive: false }}
        />
        
        <DashboardCard
          title="Pending Requests"
          value="18"
          icon={<HiOutlineClipboardList className="w-6 h-6" />}
        />
        
        <DashboardCard
          title="Monthly Reports"
          value="8"
          icon={<HiOutlineChartBar className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: true }}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {/* Activity items would go here */}
            <p className="text-gray-600">No recent activities to display</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
          <div className="space-y-4">
            {/* Task items would go here */}
            <p className="text-gray-600">No upcoming tasks to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 