import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Get all ServiceDocument records
    const documents = await prisma.serviceDocument.findMany({
      include: {
        document: true,
        serviceRequest: true
      }
    });
    
    // Delete invalid documents
    for (const doc of documents) {
      if (!doc.document || !doc.serviceRequest) {
        await prisma.serviceDocument.delete({
          where: {
            id: doc.id
          }
        });
        console.log(`Deleted orphaned document with ID: ${doc.id}`);
      }
    }

    // Delete documents with missing required fields
    await prisma.serviceDocument.deleteMany({
      where: {
        OR: [
          {
            documentId: {
              equals: undefined
            }
          },
          {
            serviceRequestId: {
              equals: undefined
            }
          }
        ]
      }
    });

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup(); 