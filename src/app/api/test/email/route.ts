import { NextResponse } from 'next/server';
import { testEmailSetup } from '@/utils/testEmail';

export async function POST() {
  try {
    const result = await testEmailSetup();
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Email test completed successfully'
      });
    } else {
      throw new Error('Email test failed');
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 