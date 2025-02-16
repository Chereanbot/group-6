export const emailTemplates = {
  reminder: (data: {
    clientName: string;
    text: string;
    requestId: string;
    pendingItems: string[];
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Action Required: Service Request Update</h2>
        
        <p style="color: #374151; margin-bottom: 16px;">Dear ${data.clientName},</p>
        
        <p style="color: #374151; margin-bottom: 16px;">${data.text}</p>
        
        ${data.pendingItems.length ? `
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
            <h3 style="color: #4b5563; margin-top: 0; margin-bottom: 12px;">Pending Items:</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              ${data.pendingItems.map(item => `
                <li style="margin-bottom: 8px;">${item}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        <p style="color: #374151; margin-bottom: 16px;">Please log in to your account to take necessary actions.</p>
        
        <p style="color: #6b7280; margin-bottom: 16px;">Request ID: ${data.requestId}</p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    </div>
  `
}; 