const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupSessions() {
  try {
    // Find sessions to delete
    const sessionsToDelete = await prisma.session.findMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { active: false }
        ]
      },
      select: { id: true }
    });

    let deletedCount = 0;
    for (const session of sessionsToDelete) {
      try {
        await prisma.session.delete({ where: { id: session.id } });
        deletedCount++;
      } catch (err) {
        if (err.code === 'P2025') {
          console.warn(`Session ${session.id} already deleted or not found.`);
        } else {
          console.error(`Error deleting session ${session.id}:`, err);
        }
      }
    }

    console.log(`Cleaned up ${deletedCount} invalid sessions`);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSessions(); 