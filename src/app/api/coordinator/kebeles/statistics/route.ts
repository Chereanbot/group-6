import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get all kebeles with their cases, selecting only needed fields
    const kebeles = await prisma.kebele.findMany({
      select: {
        id: true,
        kebeleNumber: true,
        kebeleName: true,
        population: true,
        district: true,
        services: true,
        cases: {
          select: {
            category: true
          }
        }
      }
    });

    if (!kebeles || kebeles.length === 0) {
      return NextResponse.json({
        totalKebeles: 0,
        totalPopulation: 0,
        averagePopulation: 0,
        totalCases: 0,
        populationByDistrict: [],
        casesByType: [],
        serviceDistribution: []
      });
    }

    // Calculate total population and average
    const totalPopulation = kebeles.reduce((sum, kebele) => sum + (kebele.population || 0), 0);
    const averagePopulation = kebeles.length > 0 ? Math.round(totalPopulation / kebeles.length) : 0;

    // Calculate total cases
    const totalCases = kebeles.reduce((sum, kebele) => sum + (kebele.cases?.length || 0), 0);

    // Group population by district
    const populationByDistrict = kebeles.reduce((acc, kebele) => {
      if (kebele.district) {
        const existing = acc.find(item => item.district === kebele.district);
        if (existing) {
          existing.population += kebele.population || 0;
        } else {
          acc.push({
            district: kebele.district,
            population: kebele.population || 0
          });
        }
      }
      return acc;
    }, [] as { district: string; population: number }[]);

    // Count cases by type
    const casesByType = kebeles.reduce((acc, kebele) => {
      kebele.cases?.forEach(case_ => {
        if (case_?.category) {
          const existing = acc.find(item => item.type === case_.category);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ type: case_.category, count: 1 });
          }
        }
      });
      return acc;
    }, [] as { type: string; count: number }[]);

    // Count service distribution
    const serviceDistribution = kebeles.reduce((acc, kebele) => {
      kebele.services?.forEach(service => {
        if (service) {
          const existing = acc.find(item => item.service === service);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ service, count: 1 });
          }
        }
      });
      return acc;
    }, [] as { service: string; count: number }[]);

    return NextResponse.json({
      totalKebeles: kebeles.length,
      totalPopulation,
      averagePopulation,
      totalCases,
      populationByDistrict,
      casesByType,
      serviceDistribution
    });
  } catch (error) {
    console.error('Error fetching kebele statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kebele statistics' },
      { status: 500 }
    );
  }
} 