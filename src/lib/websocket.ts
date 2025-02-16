import { Server as WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import { prisma } from './prisma';

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send initial metrics
    sendSecurityMetrics(ws);

    // Set up periodic updates
    const metricsInterval = setInterval(() => {
      sendSecurityMetrics(ws);
    }, 30000); // Update every 30 seconds

    ws.on('close', () => {
      clearInterval(metricsInterval);
    });
  });

  return wss;
}

async function sendSecurityMetrics(ws: WebSocket) {
  try {
    const [
      activeUsers,
      failedLogins,
      suspiciousActivities,
      blockedIPs
    ] = await Promise.all([
      prisma.session.count({ where: { active: true } }),
      prisma.securityLog.count({
        where: {
          eventType: 'LOGIN_FAILURE',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          severity: { in: ['high', 'critical'] },
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.blockedIP.count()
    ]);

    // Calculate threat level based on metrics
    const threatLevel = calculateThreatLevel({
      activeUsers,
      failedLogins,
      suspiciousActivities,
      blockedIPs
    });

    ws.send(JSON.stringify({
      type: 'metrics',
      metrics: {
        activeUsers,
        failedLogins,
        suspiciousActivities,
        blockedIPs,
        threatLevel
      }
    }));
  } catch (error) {
    console.error('Error sending security metrics:', error);
  }
}

function calculateThreatLevel(metrics: {
  activeUsers: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
}): 'low' | 'medium' | 'high' | 'critical' {
  const { failedLogins, suspiciousActivities, blockedIPs } = metrics;
  
  if (suspiciousActivities > 10 || blockedIPs > 20) {
    return 'critical';
  }
  if (suspiciousActivities > 5 || failedLogins > 50) {
    return 'high';
  }
  if (suspiciousActivities > 2 || failedLogins > 20) {
    return 'medium';
  }
  return 'low';
} 