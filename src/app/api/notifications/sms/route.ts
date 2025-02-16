import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import prisma from '@/lib/prisma';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = new Twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { caseId, recipientId, recipientType, message } = await req.json();

    // Validate required fields
    if (!caseId || !recipientId || !recipientType || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch case with all related details
    const caseDetails = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        lawyer: {
          include: {
            lawyerProfile: {
              include: {
                specializations: {
                  include: {
                    specialization: true
                  }
                }
              }
            }
          }
        },
        client: true,
        assignmentHistory: {
          orderBy: {
            assignedAt: 'desc'
          },
          take: 1
        }
      },
    });

    if (!caseDetails) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Get recipient's details based on type
    let recipient;
    if (recipientType === 'lawyer') {
      recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        include: {
          lawyerProfile: {
            include: {
              specializations: {
                include: {
                  specialization: true
                }
              }
            }
          }
        }
      });
    } else {
      recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        include: {
          coordinatorProfile: {
            include: {
              office: true
            }
          }
        }
      });
    }

    if (!recipient || !recipient.phone) {
      return NextResponse.json(
        { error: 'Recipient phone number not found' },
        { status: 404 }
      );
    }

    // Format phone number (remove spaces, ensure it starts with +)
    const formattedPhone = recipient.phone.startsWith('+') 
      ? recipient.phone 
      : `+${recipient.phone.replace(/\s/g, '')}`;

    // Send SMS using Twilio
    const smsResult = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    // Save notification record with detailed metadata
    await prisma.notification.create({
      data: {
        type: 'SMS',
        message,
        caseId,
        recipientId,
        recipientType,
        status: 'SENT',
        metadata: {
          twilioMessageId: smsResult.sid,
          twilioStatus: smsResult.status,
          caseDetails: {
            title: caseDetails.title,
            category: caseDetails.category,
            type: caseDetails.type,
            priority: caseDetails.priority,
            status: caseDetails.status,
            location: {
              wereda: caseDetails.wereda,
              kebele: caseDetails.kebele
            },
            client: {
              name: caseDetails.clientName,
              phone: caseDetails.clientPhone,
              email: caseDetails.clientEmail
            },
            assignedLawyer: caseDetails.lawyer ? {
              name: caseDetails.lawyer.fullName,
              specializations: caseDetails.lawyer.lawyerProfile?.specializations.map(s => s.specialization.name)
            } : null,
            assignmentDate: caseDetails.assignmentHistory[0]?.assignedAt
          },
          recipientDetails: {
            name: recipient.fullName,
            role: recipientType,
            ...(recipientType === 'lawyer' ? {
              specializations: (recipient as any).lawyerProfile?.specializations.map((s: any) => s.specialization.name)
            } : {
              office: (recipient as any).coordinatorProfile?.office?.name,
              location: (recipient as any).coordinatorProfile?.office?.location
            })
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: smsResult.sid,
      details: {
        case: {
          title: caseDetails.title,
          status: caseDetails.status,
          assignedLawyer: caseDetails.lawyer?.fullName
        },
        recipient: {
          name: recipient.fullName,
          role: recipientType
        }
      }
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 