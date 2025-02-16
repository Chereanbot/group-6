import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupMessages() {
  try {
    console.log('Starting messages cleanup...');

    // Delete orphaned attachments
    const orphanedAttachments = await prisma.attachment.deleteMany({
      where: {
        messageId: {
          equals: undefined
        }
      }
    });
    console.log(`Deleted ${orphanedAttachments.count} orphaned attachments`);

    // Delete orphaned reactions
    const orphanedReactions = await prisma.messageReaction.deleteMany({
      where: {
        OR: [
          {
            messageId: {
              equals: undefined
            }
          },
          {
            userId: {
              equals: undefined
            }
          }
        ]
      }
    });
    console.log(`Deleted ${orphanedReactions.count} orphaned reactions`);

    // Delete orphaned notifications
    const orphanedNotifications = await prisma.messageNotification.deleteMany({
      where: {
        OR: [
          {
            messageId: {
              equals: undefined
            }
          },
          {
            userId: {
              equals: undefined
            }
          }
        ]
      }
    });
    console.log(`Deleted ${orphanedNotifications.count} orphaned notifications`);

    // Delete orphaned thread participants
    const orphanedParticipants = await prisma.threadParticipant.deleteMany({
      where: {
        OR: [
          {
            threadId: {
              equals: undefined
            }
          },
          {
            userId: {
              equals: undefined
            }
          }
        ]
      }
    });
    console.log(`Deleted ${orphanedParticipants.count} orphaned thread participants`);

    // Delete empty message threads
    const emptyThreads = await prisma.messageThread.deleteMany({
      where: {
        messages: {
          none: {}
        }
      }
    });
    console.log(`Deleted ${emptyThreads.count} empty message threads`);

    // Clean up messages with missing sender or recipient
    const invalidMessages = await prisma.message.deleteMany({
      where: {
        OR: [
          {
            senderId: {
              equals: undefined
            }
          },
          {
            recipientId: {
              equals: undefined
            }
          }
        ]
      }
    });
    console.log(`Deleted ${invalidMessages.count} invalid messages`);

    // Update message threads that should be archived
    const archivedThreads = await prisma.messageThread.updateMany({
      where: {
        messages: {
          every: {
            isArchived: true
          }
        }
      },
      data: {
        isArchived: true
      }
    });
    console.log(`Archived ${archivedThreads.count} message threads`);

    console.log('Messages cleanup completed successfully');
  } catch (error) {
    console.error('Error during messages cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function validateMessageData() {
  try {
    console.log('Starting message data validation...');

    // Check for messages with invalid thread references
    const messagesWithInvalidThreads = await prisma.message.findMany({
      where: {
        AND: [
          {
            threadId: {
              not: undefined
            }
          },
          {
            threadId: {
              equals: undefined
            }
          }
        ]
      }
    });
    console.log(`Found ${messagesWithInvalidThreads.length} messages with invalid thread references`);

    // Check for duplicate reactions - new implementation
    const reactions = await prisma.messageReaction.groupBy({
      by: ['messageId', 'userId', 'type'],
      _count: {
        _all: true
      }
    });

    const duplicates = reactions.filter(r => r._count._all > 1);
    console.log(`Found ${duplicates.length} duplicate reactions`);

    // Check for thread participants without messages
    const inactiveParticipants = await prisma.threadParticipant.findMany({
      where: {
        thread: {
          messages: {
            none: {
              OR: [
                {
                  senderId: {
                    equals: undefined
                  }
                },
                {
                  recipientId: {
                    equals: undefined
                  }
                }
              ]
            }
          }
        }
      },
      include: {
        thread: true,
        user: true
      }
    });
    console.log(`Found ${inactiveParticipants.length} inactive thread participants`);

    console.log('Message data validation completed');
  } catch (error) {
    console.error('Error during message data validation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run both cleanup and validation
async function main() {
  await cleanupMessages();
  await validateMessageData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 