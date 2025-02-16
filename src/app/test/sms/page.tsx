'use client';

import { useState } from 'react';

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    try {
      const response = await fetch('/api/messages/phone/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          content: message
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert('SMS sent successfully!');
      } else {
        alert('Failed to send SMS: ' + data.error);
      }
    } catch (error) {
      console.error('Test failed:', error);
      setResult({ error: 'Failed to send SMS' });
    }
  };

  const verifyCredentials = async () => {
    try {
      const response = await fetch('/api/messages/phone/verify-credentials');
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert('Twilio credentials are valid! Account status: ' + data.status);
      } else {
        alert('Invalid credentials: ' + data.error);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({ error: 'Failed to verify credentials' });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test SMS Sending</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Phone Number:</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 rounded"
            placeholder="0947006369"
          />
        </div>
        <div>
          <label className="block mb-2">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Test message"
          />
        </div>
        <button
          onClick={handleTest}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Test SMS
        </button>
        <button
          onClick={verifyCredentials}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Verify Credentials
        </button>
        {result && (
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
} 