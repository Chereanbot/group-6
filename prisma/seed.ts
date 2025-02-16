import { 
  PrismaClient, 
  UserStatus, 
  UserRoleEnum, 
  NotificationType,
  OfficeType,
  OfficeStatus,
  ServiceType,
  ServiceCategory,
  CoordinatorType,
  MessagePriority,
  MessageCategory
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { legalSpecializations } from '../src/data/specializations';
import { caseLawSeeds } from './seeds/case-laws';
import { messageSeeds } from './seeds/messages';
import { defaultTemplates } from './seeds/templateSeeds';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'cherean123';

async function seedOffices() {
  const offices = [
    {
      name: 'YIRGA_CHAFE',
      location: 'Yirga Chafe', 
      type: OfficeType.BRANCH,
      status: OfficeStatus.ACTIVE,
      contactEmail: 'yirga@dula.edu.et',
      contactPhone: '+251911234567',
      address: 'Main Street, Yirga Chafe',
      capacity: 10
    },
    {
      name: 'BULE',
      location: 'Bule',
      type: OfficeType.BRANCH,
      status: OfficeStatus.ACTIVE,
      contactEmail: 'bule@dula.edu.et',
      contactPhone: '+251922345678',
      address: 'Central Area, Bule',
      capacity: 8
    },
    {
      name: 'DILLA',
      location: 'Dilla',
      type: OfficeType.HEADQUARTERS,
      status: OfficeStatus.ACTIVE,
      contactEmail: 'dilla@dula.edu.et',
      contactPhone: '+251933456789',
      address: 'University Campus, Dilla',
      capacity: 15
    }
  ];

  for (const office of offices) {
    await prisma.office.upsert({
      where: { name: office.name },
      update: {},
      create: office
    });
  }

  console.log('Seeded offices');
}

async function seedCoordinators() {
  console.log('Seeding coordinators...');
  
  // First create coordinator users
  const coordinatorUsers = [
    {
      email: 'coordinator1@dula.edu.et',
      password: await bcrypt.hash('cherinet', 10),
      fullName: 'Coordinator One',
      userRole: UserRoleEnum.COORDINATOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251988111222'
    },
    {
      email: 'coordinator2@dula.edu.et',
      password: await bcrypt.hash('cherinet', 10),
      fullName: 'Coordinator Two',
      userRole: UserRoleEnum.COORDINATOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251988333444'
    }
  ];

  // Get office IDs
  const yirgaOffice = await prisma.office.findUnique({
    where: { name: 'YIRGA_CHAFE' }
  });

  const buleOffice = await prisma.office.findUnique({
    where: { name: 'BULE' }
  });

  if (!yirgaOffice || !buleOffice) {
    throw new Error('Required offices not found');
  }

  // Create users and their coordinator profiles
  for (const userData of coordinatorUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });

    // Create coordinator profile
    await prisma.coordinator.upsert({
      where: { userId: user.id },
      update: {
        type: CoordinatorType.FULL_TIME,
        officeId: yirgaOffice.id,
        specialties: ["Criminal Law", "Family Law"],
        status: UserStatus.ACTIVE
      },
      create: {
        userId: user.id,
        type: CoordinatorType.FULL_TIME,
        officeId: yirgaOffice.id,
        specialties: ["Criminal Law", "Family Law"],
        status: UserStatus.ACTIVE
      }
    });
  }

  console.log('Coordinators seeded successfully');
}

async function seedLawyers() {
  const hashedPassword = await bcrypt.hash('cherean123', 10);

  const lawyers = [
    {
      email: 'criminal.lawyer@dula.edu.et',
      fullName: 'Dr. Abebe Kebede',
      phone: '+251977111222',
      specializations: ['Criminal Law'],
      office: 'DILLA',
      experience: 8,
      barNumber: 'ETH-BAR-001',
      expertise: ['Criminal Defense', 'Constitutional Law'],
      languages: ['Amharic', 'English']
    },
    {
      email: 'civil.lawyer@dula.edu.et',
      fullName: 'Dr. Tigist Alemu',
      phone: '+251977333444',
      specializations: ['Civil Law'],
      office: 'YIRGA_CHAFE',
      experience: 6,
      barNumber: 'ETH-BAR-002',
      expertise: ['Civil Litigation', 'Family Law'],
      languages: ['Amharic', 'English', 'Sidamic']
    },
    {
      email: 'corporate.lawyer@dula.edu.et',
      fullName: 'Dr. Solomon Tadesse',
      phone: '+251977555666',
      specializations: ['Corporate Law'],
      office: 'DILLA',
      experience: 12,
      barNumber: 'ETH-BAR-003',
      expertise: ['Corporate Law', 'Business Law', 'Tax Law'],
      languages: ['Amharic', 'English', 'French']
    }
  ];

  for (const lawyer of lawyers) {
    const office = await prisma.office.findUnique({
      where: { name: lawyer.office }
    });

    if (!office) {
      console.log(`Office ${lawyer.office} not found, skipping lawyer`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: lawyer.email,
        password: hashedPassword,
        fullName: lawyer.fullName,
        phone: lawyer.phone,
        userRole: UserRoleEnum.LAWYER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true
      }
    });

  
    await prisma.lawyerProfile.create({
      data: {
        userId: user.id,
        specializations: {
          create: lawyer.specializations.map(spec => ({
            specialization: {
              connectOrCreate: {
                where: { name: spec },
                create: {
                  name: spec,
                  category: 'GENERAL',
                  description: `Specialization in ${spec}`
                }
              }
            },
            yearsExperience: lawyer.experience,
            isMainFocus: true
          }))
        },
        experience: lawyer.experience,
        rating: 4.5,
        caseLoad: 0,
        availability: true,
        officeId: office.id
      }
    });

  
    await prisma.notificationPreference.create({
      data: {
        userId: user.id,
        type: NotificationType.TASK_ASSIGNED,
        email: true,
        sms: true,
        push: true,
        inApp: true
      }
    });
  }

  console.log('Seeded lawyers');
}

async function cleanDatabase() {
  try {
    // First level - most dependent
    await prisma.reminder.deleteMany({});
    await prisma.communication.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.verificationRecord.deleteMany({});
    await prisma.serviceDocument.deleteMany({});
    await prisma.serviceActivity.deleteMany({});
    await prisma.serviceNote.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.reminderPreference.deleteMany({});
    await prisma.serviceRequest.deleteMany({});

    // Delete templates before coordinator
    await prisma.template.deleteMany({});

    // Second level
    await prisma.servicePackage.deleteMany({});
    await prisma.qualificationDocument.deleteMany({});
    await prisma.qualification.deleteMany({});
    await prisma.coordinatorDocument.deleteMany({});
    await prisma.coordinatorAssignment.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.coordinator.deleteMany({});

    // Case related
    await prisma.appealHearing.deleteMany({});
    await prisma.appealDocument.deleteMany({});
    await prisma.appeal.deleteMany({});
    await prisma.caseActivity.deleteMany({});
    await prisma.caseDocument.deleteMany({});
    await prisma.caseNote.deleteMany({});
    await prisma.caseAssignment.deleteMany({});
    await prisma.case.deleteMany({});

    // User related - delete dependent records first
    await prisma.performance.deleteMany({});
    await prisma.lawyerSpecialization.deleteMany({});
    await prisma.lawyerProfile.deleteMany({});
    await prisma.notificationPreference.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.oTPVerification.deleteMany({});
    await prisma.rolePermission.deleteMany({});
    
    // Session must be deleted before User
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.permission.deleteMany({});

    // Office related
    await prisma.officePerformance.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.office.deleteMany({});

    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

async function seedInitialData() {
  // Create default permissions
  const defaultPermissions = [
    // System & Auth
    { name: 'AUTH_LOGIN', module: 'AUTH', description: 'Can login to system' },
    { name: 'AUTH_VERIFY', module: 'AUTH', description: 'Can verify account' },
    
    // Users
    { name: 'MANAGE_USERS', module: 'USERS', description: 'Can manage users' },
    { name: 'VIEW_USERS', module: 'USERS', description: 'Can view users' },
    { name: 'MANAGE_ROLES', module: 'USERS', description: 'Can manage roles' },
    { name: 'MANAGE_PERMISSIONS', module: 'USERS', description: 'Can manage permissions' },
    
    // Cases
    { name: 'MANAGE_CASES', module: 'CASES', description: 'Can manage cases' },
    { name: 'VIEW_CASES', module: 'CASES', description: 'Can view cases' },
    { name: 'ASSIGN_CASES', module: 'CASES', description: 'Can assign cases' },
    
    // Services
    { name: 'MANAGE_SERVICES', module: 'SERVICES', description: 'Can manage services' },
    { name: 'VIEW_SERVICES', module: 'SERVICES', description: 'Can view services' },
    
    // Payments
    { name: 'MANAGE_PAYMENTS', module: 'PAYMENTS', description: 'Can manage payments' },
    { name: 'VIEW_PAYMENTS', module: 'PAYMENTS', description: 'Can view payments' },
    
    // Reports & Settings
    { name: 'VIEW_REPORTS', module: 'REPORTS', description: 'Can view reports' },
    { name: 'MANAGE_SETTINGS', module: 'SETTINGS', description: 'Can manage settings' },
  ];

  const permissions = await Promise.all(
    defaultPermissions.map(permission =>
      prisma.permission.create({
        data: permission
      })
    )
  );

  // Create roles with their base permissions
  const [superAdminRole, coordinatorRole] = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Super Admin',
        description: 'Full system access'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Coordinator',
        description: 'Case coordination and management'
      }
    })
  ]);

  // Assign all permissions to super admin
  await Promise.all(
    permissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  // Assign limited permissions to coordinator
  const coordinatorPermissions = permissions.filter(p => [
    'AUTH_LOGIN',
    'AUTH_VERIFY',
    'VIEW_CASES',
    'VIEW_SERVICES',
    'VIEW_USERS'
  ].includes(p.name));

  await Promise.all(
    coordinatorPermissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: coordinatorRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  // Create all admin users with the same password
  const adminPassword = await bcrypt.hash('cherinet', 10);
  
  const allAdminUsers = [
    // Super Admins
    {
      email: 'cherinetadmiin@gmail.com',
      password: adminPassword,
      fullName: 'Super Admin One',
      userRole: UserRoleEnum.SUPER_ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251955111222',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    },
    {
      email: 'cherinetadmin2@gmail.com',
      password: adminPassword,
      fullName: 'Super Admin Two',
      userRole: UserRoleEnum.SUPER_ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251955333444',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    },
    {
      email: 'cherinetadmin3@gmail.com',
      password: adminPassword,
      fullName: 'Super Admin Three',
      userRole: UserRoleEnum.SUPER_ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251955555666',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    },
    {
      email: 'cherinetadmin4@gmail.com',
      password: adminPassword,
      fullName: 'Super Admin Four',
      userRole: UserRoleEnum.SUPER_ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251955777888',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    },
    // Regular Admins
    {
      email: 'cherinet.admin1@gmail.com',
      password: adminPassword,
      fullName: 'Admin One',
      userRole: UserRoleEnum.ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251944333444',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    },
    {
      email: 'cherinet.admin2@gmail.com',
      password: adminPassword,
      fullName: 'Admin Two',
      userRole: UserRoleEnum.ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251944555666',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    },
    {
      email: 'cherinet.admin3@gmail.com',
      password: adminPassword,
      fullName: 'Admin Three',
      userRole: UserRoleEnum.ADMIN,
      isAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      phone: '+251944777888',
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    }
  ];

  // Create all admin users and their sessions
  for (const adminData of allAdminUsers) {
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {},
      create: adminData
    });

    // Create a session for each admin
    await prisma.session.create({
      data: {
        userId: admin.id,
        token: `admin-token-${admin.id}`,
        active: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userAgent: 'Seed Script',
        lastIpAddress: '127.0.0.1'
      }
    });

    // Create activity log for each admin
    await prisma.activity.create({
      data: {
        action: 'USER_CREATED',
        details: {
          event: `${adminData.userRole} user created`,
          description: `${adminData.userRole} account created for ${admin.fullName}`
        },
        userId: admin.id
      }
    });
  }

  // Create coordinator user
  const coordinator = await prisma.user.create({
    data: {
      email: 'cherinetcoordinator@gmail.com',
      password: adminPassword,
      fullName: 'John Coordinator',
      userRole: UserRoleEnum.COORDINATOR,
      phone: '+251988777888',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      roleId: coordinatorRole.id,
      notificationPrefs: {
        create: {
          email: true,
          push: true,
          sms: true,
          type: NotificationType.SYSTEM_UPDATE
        }
      }
    }
  });

  // Create a session for testing
  await prisma.session.create({
    data: {
      userId: coordinator.id,
      token: 'test-token',
      active: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    }
  });

  // Create activity log
  await prisma.activity.create({
    data: {
      action: 'SYSTEM_INIT',
      details: {
        event: 'System initialization',
        description: 'System initialized with super admin account'
      },
      userId: coordinator.id
    }
  });

  // Create service packages
  const consultationPackage = await prisma.servicePackage.create({
    data: {
      name: 'Legal Consultation',
      description: 'Initial legal consultation service',
      serviceType: ServiceType.CONSULTATION,
      category: ServiceCategory.CIVIL_LAW,
      price: 150.00,
      features: ['60-minute consultation', 'Written summary', 'Follow-up email'],
      eligibilityCriteria: ['Must be 18 or older'],
      estimatedDuration: '1-2 hours',
      active: true,
      user: {
        connect: { id: coordinator.id }
      },
      createdBy: {
        connect: { id: coordinator.id }
      }
    }
  });

  // Add admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'Admin User',
      userRole: UserRoleEnum.ADMIN,
      isAdmin: true,
      emailVerified: true,
      status: 'ACTIVE'
    }
  });

  return { 
    coordinator,
    consultationPackage 
  };
}

async function verifySeeding() {
  console.log('\nVerifying seeding results...');
  
  // Check offices
  const offices = await prisma.office.findMany();
  console.log('\nOffices created:', offices.length);
  offices.forEach(office => {
    console.log(`- ${office.name} (${office.id})`);
  });

  // Check coordinators
  const coordinators = await prisma.coordinator.findMany({
    include: {
      user: true,
      office: true
    }
  });
  console.log('\nCoordinators created:', coordinators.length);
  coordinators.forEach(coord => {
    console.log(`- ${coord.user.fullName} (${coord.user.email}) - Office: ${coord.office?.name || 'No office'}`);
  });
}

async function seedCaseLaws() {
  console.log('Seeding case laws...');
  
  for (const caseLawData of caseLawSeeds) {
    const { specializationName, ...caseData } = caseLawData;
    
    // Find the specialization
    const specialization = await prisma.legalSpecialization.findUnique({
      where: { name: specializationName }
    });

    if (!specialization) {
      console.log(`Specialization ${specializationName} not found, skipping case`);
      continue;
    }

    // Create the case law with specialization connection
    await prisma.caseLaw.create({
      data: {
        ...caseData,
        specialization: {
          connect: { id: specialization.id }
        }
      }
    });
  }

  console.log('Case laws seeded successfully');
}

async function seedTemplates() {
  console.log('Seeding templates...');
  
  // Get all coordinators to assign templates
  const coordinators = await prisma.coordinator.findMany({
    include: {
      office: true
    }
  });

  if (coordinators.length === 0) {
    console.log('No coordinators found, skipping template seeding');
    return;
  }

  // Assign templates to coordinators
  for (const type in defaultTemplates) {
    for (const template of defaultTemplates[type]) {
      // For each template, assign to first coordinator by default
      const coordinator = coordinators[0];
      
      const existingTemplate = await prisma.template.findFirst({
        where: {
          name: template.name,
          type: type as any
        }
      });

      if (!existingTemplate) {
        await prisma.template.create({
          data: {
            ...template,
            type: type as any,
            createdBy: coordinator.userId,
            officeId: coordinator.officeId
          }
        });
      }
    }
  }

  console.log('Templates seeded successfully');
}

async function seedSettings() {
  // First create categories
  const categories = [
    { name: 'SYSTEM' },
    { name: 'EMAIL' },
    { name: 'NOTIFICATION' }
  ];

  for (const category of categories) {
    await prisma.settingsCategory.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name }
    });
  }

  // Get category IDs
  const systemCategory = await prisma.settingsCategory.findUnique({
    where: { name: 'SYSTEM' }
  });

  const emailCategory = await prisma.settingsCategory.findUnique({
    where: { name: 'EMAIL' }
  });

  const notificationCategory = await prisma.settingsCategory.findUnique({
    where: { name: 'NOTIFICATION' }
  });

  // Create settings
  const defaultSettings = [
    {
      key: 'SITE_NAME',
      value: 'Du Las',
      type: 'SYSTEM',
      categoryId: systemCategory!.id
    },
    {
      key: 'SMTP_HOST',
      value: 'smtp.gmail.com',
      type: 'EMAIL',
      categoryId: emailCategory!.id
    },
    {
      key: 'NOTIFICATION_ENABLED',
      value: 'true',
      type: 'NOTIFICATION',
      categoryId: notificationCategory!.id
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }

  console.log('Settings seeded successfully');
}

async function main() {
  try {
    console.log('Starting database cleanup...');
    await cleanDatabase();
    
    console.log('Starting to seed database...');
    await seedOffices();
    await seedCoordinators();
    await seedLawyers();
    await seedSpecializations();
    await seedCaseLaws();
    await seedInitialData();
    await seedMessages();
    await seedTemplates();
    await seedSettings();
    
    await verifySeeding();
    
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error during database operations:', error);
    throw error;
  }
}

async function seedSpecializations() {
  // Seed specializations
  for (const spec of legalSpecializations) {
    await prisma.legalSpecialization.upsert({
      where: { name: spec.name },
      update: {},
      create: {
        name: spec.name,
        category: spec.category,
        description: spec.description,
        subFields: spec.subFields
      }
    });
  }

  console.log('Specializations seeded successfully');
}

async function seedMessages() {
  console.log('Seeding messages...');
  
  // First get or create test users if they don't exist
  const lawyer = await prisma.user.findFirst({
    where: { userRole: 'LAWYER' }
  });
  
  const client = await prisma.user.findFirst({
    where: { userRole: 'CLIENT' }
  });

  if (!lawyer || !client) {
    console.log('Required users not found, skipping message seeding');
    return;
  }

  // Update message seeds with actual user IDs
  const messagesToCreate = messageSeeds.map(msg => ({
    ...msg,
    senderId: msg.senderId === 'lawyer-1' ? lawyer.id : client.id,
    recipientId: msg.recipientId === 'lawyer-1' ? lawyer.id : client.id,
    priority: msg.priority as MessagePriority,
    category: msg.category as MessageCategory
  }));

  for (const message of messagesToCreate) {
    try {
      await prisma.message.create({
        data: {
          subject: message.subject,
          content: message.content,
          sender: { connect: { id: message.senderId } },
          recipient: { connect: { id: message.recipientId } },
          priority: message.priority as MessagePriority,
          category: message.category as MessageCategory,
          isRead: message.isRead,
          isStarred: message.isStarred,
          isArchived: message.isArchived
        }
      });
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  console.log('Messages seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });