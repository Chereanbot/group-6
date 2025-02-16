import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import PDFDocument from 'pdfkit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { format } = await request.json();

    // Get case details
    const caseLaw = await prisma.caseLaw.findUnique({
      where: { id: params.id },
      include: {
        specialization: true
      }
    });

    if (!caseLaw) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    let fileContent: Buffer;

    switch (format) {
      case 'pdf':
        fileContent = await generatePDF(caseLaw);
        break;
      case 'docx':
        fileContent = await generateDOCX(caseLaw);
        break;
      case 'txt':
        fileContent = await generateTXT(caseLaw);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid format" },
          { status: 400 }
        );
    }

    // Log export activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'CASE_EXPORT',
        details: {
          caseId: caseLaw.id,
          format,
          timestamp: new Date()
        }
      }
    });

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': getContentType(format),
        'Content-Disposition': `attachment; filename="case-${caseLaw.id}.${format}"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: "Failed to export case" },
      { status: 500 }
    );
  }
}

async function generatePDF(caseLaw: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Add content to PDF
    doc.fontSize(20).text(caseLaw.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Citation: ${caseLaw.citation}`);
    doc.moveDown();
    doc.text(`Court: ${caseLaw.court}`);
    doc.text(`Date: ${new Date(caseLaw.date).toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Summary:', { underline: true });
    doc.text(caseLaw.summary);
    doc.moveDown();
    doc.text('Full Text:', { underline: true });
    doc.text(caseLaw.content);

    doc.end();
  });
}

async function generateDOCX(caseLaw: any): Promise<Buffer> {
  // Implement DOCX generation
  const content = `
    ${caseLaw.title}
    
    Citation: ${caseLaw.citation}
    Court: ${caseLaw.court}
    Date: ${new Date(caseLaw.date).toLocaleDateString()}
    
    Summary:
    ${caseLaw.summary}
    
    Full Text:
    ${caseLaw.content}
  `;

  return Buffer.from(content);
}

async function generateTXT(caseLaw: any): Promise<Buffer> {
  const content = `
    ${caseLaw.title}
    
    Citation: ${caseLaw.citation}
    Court: ${caseLaw.court}
    Date: ${new Date(caseLaw.date).toLocaleDateString()}
    
    Summary:
    ${caseLaw.summary}
    
    Full Text:
    ${caseLaw.content}
  `;

  return Buffer.from(content);
}

function getContentType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
} 