"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineShieldExclamation,
  HiOutlineBell,
  HiOutlineGlobe,
  HiOutlineChartBar
} from 'react-icons/hi';

interface SecurityMetrics {
  activeUsers: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RealtimeAlert {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function SecurityMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeUsers: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    threatLevel: 'low'
  });
  const [realtimeAlerts, setRealtimeAlerts] = useState<RealtimeAlert[]>([]);

  useEffect(() => {
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics') {
        setMetrics(data.metrics);
      } else if (data.type === 'alert') {
        handleNewAlert(data.alert);
      }
    };

    return () => ws.close();
  }, []);

  const handleNewAlert = (alert: RealtimeAlert) => {
    setRealtimeAlerts(prev => [alert, ...prev].slice(0, 10));
    if (alert.severity === 'high' || alert.severity === 'critical') {
      toast.error(alert.message, {
        duration: 5000,
        icon: '🚨'
      });
    }
  };

  const getThreatLevelColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.activeUsers}</p>
            </div>
            <HiOutlineGlobe className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Logins (24h)</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.failedLogins}</p>
            </div>
            <HiOutlineShieldExclamation className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious Activities</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.suspiciousActivities}</p>
            </div>
            <HiOutlineBell className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked IPs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.blockedIPs}</p>
            </div>
            <HiOutlineChartBar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Threat Level Indicator */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Threat Level</h3>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-full ${getThreatLevelColor(metrics.threatLevel)}`}>
            {metrics.threatLevel.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            System security status is currently at {metrics.threatLevel} risk level
          </p>
        </div>
      </div>

      {/* Real-time Alerts */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Real-time Alerts</h3>
        <div className="space-y-4">
          {realtimeAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-green-500 bg-green-50 dark:bg-green-900/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 