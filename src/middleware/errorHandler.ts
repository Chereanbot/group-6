import { NextResponse } from 'next/server';

export function handleApiError(error: any) {
  console.error('API Error:', error);

  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: 'A template with this name already exists' },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
} 