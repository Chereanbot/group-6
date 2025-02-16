import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['CASE', 'CLIENT', 'DOCUMENT', 'REPORT']),
  content: z.object({
    sections: z.array(z.object({
      title: z.string().min(1, 'Section title is required'),
      fields: z.array(z.string().min(1, 'Field name is required'))
    }))
  }),
  isDefault: z.boolean().optional()
});

export type TemplateInput = z.infer<typeof templateSchema>;

export function validateTemplate(template: any): { valid: boolean; errors?: string[] } {
  try {
    templateSchema.parse(template);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => e.message)
      };
    }
    return { valid: false, errors: ['Invalid template format'] };
  }
}

export const caseTemplateSchema = templateSchema.extend({
  type: z.literal('CASE'),
  content: z.object({
    sections: z.array(z.object({
      title: z.string().min(1),
      fields: z.array(z.string().min(1)),
      required: z.boolean().optional(),
      order: z.number().optional()
    }))
  })
});

export const documentTemplateSchema = templateSchema.extend({
  type: z.literal('DOCUMENT'),
  content: z.object({
    sections: z.array(z.object({
      title: z.string().min(1),
      fields: z.array(z.string().min(1)),
      format: z.enum(['text', 'date', 'number', 'currency']).optional(),
      validation: z.object({
        required: z.boolean(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional()
      }).optional()
    }))
  })
});

export function validateTemplateByType(template: any, type: string) {
  switch (type) {
    case 'CASE':
      return validateSchema(caseTemplateSchema, template);
    case 'DOCUMENT':
      return validateSchema(documentTemplateSchema, template);
    default:
      return validateSchema(templateSchema, template);
  }
}

function validateSchema(schema: z.ZodType<any>, data: any) {
  try {
    schema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => e.message)
      };
    }
    return { valid: false, errors: ['Invalid format'] };
  }
} 