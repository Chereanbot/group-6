import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function fixServiceTypes() {
  try {
    // Get all service packages
    const packages = await prisma.servicePackage.findMany();
    
    // Update packages with invalid service types
    for (const pkg of packages) {
      if (!Object.values(ServiceType).includes(pkg.serviceType as ServiceType)) {
        console.log(`Updating package ${pkg.id} from ${pkg.serviceType} to CONSULTATION`);
        await prisma.servicePackage.update({
          where: { id: pkg.id },
          data: { serviceType: ServiceType.CONSULTATION }
        });
      }
    }
    
    console.log('Service types fixed successfully');
  } catch (error) {
    console.error('Error fixing service types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixServiceTypes(); 