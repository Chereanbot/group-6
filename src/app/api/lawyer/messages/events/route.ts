import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));
      
      // Handle client disconnection
      request.signal.addEventListener('abort', () => {
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 