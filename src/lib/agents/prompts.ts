export const agentInstructions = [
  {
    id: 'loan_monitoring',
    type: 'task',
    description: `
      Monitor loan applications and status:
      1. Track new loan applications
      2. Monitor payment schedules
      3. Identify late payments
      4. Alert on high-risk accounts
      5. Generate summary reports
    `,
    priority: 'high'
  },
  {
    id: 'savings_analysis',
    type: 'task',
    description: `
      Analyze savings patterns:
      1. Track savings growth rates
      2. Identify unusual withdrawals
      3. Monitor savings goals
      4. Suggest optimization strategies
      5. Generate performance reports
    `,
    priority: 'medium'
  },
  {
    id: 'document_management',
    type: 'task',
    description: `
      Manage documentation:
      1. Track required documents
      2. Monitor document expiration
      3. Verify completeness
      4. Flag missing documents
      5. Ensure compliance
    `,
    priority: 'high'
  },
  {
    id: 'user_support',
    type: 'task',
    description: `
      Monitor user support needs:
      1. Track common questions
      2. Identify trending issues
      3. Suggest FAQ updates
      4. Monitor response times
      5. Alert on urgent inquiries
    `,
    priority: 'medium'
  },
  {
    id: 'compliance_monitoring',
    type: 'rule',
    description: `
      Ensure regulatory compliance:
      1. Monitor policy changes
      2. Track compliance deadlines
      3. Verify documentation
      4. Alert on violations
      5. Generate compliance reports
    `,
    priority: 'high'
  },
  {
    id: 'website_monitoring',
    type: 'task',
    description: `
      Monitor website content:
      1. Track content updates
      2. Verify information accuracy
      3. Monitor system status
      4. Track user engagement
      5. Alert on critical changes
    `,
    priority: 'medium'
  }
];

export const agentPreferences = {
  notificationSettings: {
    email: true,
    dashboard: true,
    priority: {
      high: ['email', 'dashboard'],
      medium: ['dashboard'],
      low: ['dashboard']
    },
    quiet_hours: {
      start: '22:00',
      end: '06:00'
    }
  },
  monitoring: {
    websiteCheckInterval: 30, // minutes
    activityCheckInterval: 5, // minutes
    maxNotificationsPerDay: 50
  },
  reporting: {
    dailySummary: true,
    weeklySummary: true,
    monthlySummary: true
  }
};
