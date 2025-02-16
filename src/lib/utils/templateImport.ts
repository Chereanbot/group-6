"use client";

import { validateTemplate } from '../validators/templateValidators';

export async function importTemplate(file: File): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const text = await file.text();
    const template = JSON.parse(text);
    
    const validation = validateTemplate(template);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors?.join(', ') || 'Invalid template format'
      };
    }

    return {
      success: true,
      data: template
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to import template'
    };
  }
} 