import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Chapa API Keys
const CHAPA_SECRET_KEY = 'CHASECK_TEST-cIE6IPsupgrF0aQnIU4cmK0PkeJBOfwX';
const CHAPA_PUBLIC_KEY = 'CHAPUBK_TEST-40nSrRkEurW5fh4da1PD4YbDEnAEDgxg';
const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';

// Generate a unique transaction reference
const generateTxRef = () => {
  return `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate email format
const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, email, first_name, last_name } = body;

    // Validate required fields
    if (!amount || !email || !first_name || !last_name) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: amount, email, first_name, last_name'
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format. Please provide a valid email address.'
      }, { status: 400 });
    }

    // Generate a unique transaction reference
    const tx_ref = generateTxRef();

    // Prepare the request payload
    const payload = {
      amount: amount.toString(),
      currency: 'ETB',
      email: email,
      first_name: first_name,
      last_name: last_name,
      tx_ref: tx_ref,
      callback_url: `${request.headers.get('origin')}/api/payment/verify`,
      return_url: `${request.headers.get('origin')}/client/registration/personal-info`,
      customization: {
        title: 'Legal Payment',
        description: 'Legal service payment'
      }
    };

    console.log('Sending request to Chapa:', {
      url: CHAPA_API_URL,
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      payload
    });

    // Initialize payment with Chapa
    const response = await fetch(CHAPA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'X-CHAPA-PUBLIC-KEY': CHAPA_PUBLIC_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log('Chapa API response:', responseData);

    if (!response.ok) {
      console.error('Chapa API error:', responseData);
      return NextResponse.json({
        success: false,
        message: responseData.message || 'Failed to initialize payment',
        details: responseData
      }, { status: response.status });
    }

    if (!responseData.data?.checkout_url) {
      console.error('Invalid Chapa response:', responseData);
      return NextResponse.json({
        success: false,
        message: 'Failed to get checkout URL',
        details: responseData
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: responseData.data.checkout_url,
        tx_ref: tx_ref
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 