import prisma from '../prisma';

export class RoutingService {
  /**
   * Find the best faculty for a doubt and assign it, or queue it if none available.
   */
  static async routeDoubt(doubtId: string) {
    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      include: { subject: true, topic: true }
    });

    if (!doubt) throw new Error('Doubt not found');
    
    if (doubt.status !== 'SUBMITTED' && doubt.status !== 'QUEUED' && doubt.status !== 'REOPENED') {
      return null; // Don't route if already assigned or closed
    }

    const now = new Date();

    // Find all faculty in the department
    const facultyList = await prisma.facultyProfile.findMany({
      where: { departmentId: doubt.departmentId },
      include: {
        expertises: true,
        topicExpertises: true,
        assignedDoubts: {
          where: {
            doubt: {
              status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ANSWERED'] }
            }
          }
        }
      }
    });

    let bestScore = -1;
    let selectedFacultyId: string | null = null;
    let bestRoutingFactors: any = null;

    for (const faculty of facultyList) {
      // 1. Eligibility Check: Subject Expertise
      const hasSubjectExpertise = faculty.expertises.some(e => e.subjectId === doubt.subjectId);
      if (!hasSubjectExpertise) continue;

      // 2. Eligibility Check: Availability
      // Simplifying slot check for MVP, primarily relying on availableFrom / availableUntil
      let isAvailable = false;
      if (faculty.availableFrom && faculty.availableUntil) {
        if (now >= faculty.availableFrom && now <= faculty.availableUntil) {
          isAvailable = true;
        }
      }
      if (!isAvailable) continue;

      // 3. Eligibility Check: Workload Capacity
      const activeAssignmentsCount = faculty.assignedDoubts.length;
      if (activeAssignmentsCount >= faculty.maxWorkload) continue;

      // --- Calculate Score ---
      let score = 0;
      const hasTopic = !!doubt.topicId;
      const hasTopicExpertise = doubt.topicId 
        ? faculty.topicExpertises.some(e => e.topicId === doubt.topicId) 
        : false;

      let subjectScore = 0;
      let topicScore = 0;
      let availabilityScore = 0; // Assuming 100% available if passed filter
      let workloadScore = 0;

      if (hasTopic) {
        subjectScore = 40;
        topicScore = hasTopicExpertise ? 25 : 0;
        availabilityScore = 20;
        workloadScore = (1 - (activeAssignmentsCount / faculty.maxWorkload)) * 15;
      } else {
        subjectScore = 50;
        availabilityScore = 25;
        workloadScore = (1 - (activeAssignmentsCount / faculty.maxWorkload)) * 25;
      }

      score = subjectScore + topicScore + availabilityScore + workloadScore;

      if (score > bestScore) {
        bestScore = score;
        selectedFacultyId = faculty.id;
        bestRoutingFactors = {
          hasTopic,
          hasTopicExpertise,
          activeAssignmentsCount,
          maxWorkload: faculty.maxWorkload,
          subjectScore,
          topicScore,
          availabilityScore,
          workloadScore,
          totalScore: score
        };
      }
    }

    // 4. Assign or Queue
    if (selectedFacultyId) {
      // Use transaction to update doubt and create assignment
      await prisma.$transaction([
        prisma.doubt.update({
          where: { id: doubt.id },
          data: { status: 'ASSIGNED' }
        }),
        prisma.doubtAssignment.create({
          data: {
            doubtId: doubt.id,
            facultyId: selectedFacultyId,
            routingScore: bestScore,
            routingFactors: JSON.stringify(bestRoutingFactors)
          }
        }),
        prisma.activityLog.create({
          data: {
            doubtId: doubt.id,
            action: 'ASSIGNED',
            details: JSON.stringify({ facultyId: selectedFacultyId, score: bestScore })
          }
        })
      ]);
      return selectedFacultyId;
    } else {
      // Queue it
      await prisma.$transaction([
        prisma.doubt.update({
          where: { id: doubt.id },
          data: { status: 'QUEUED' }
        }),
        prisma.activityLog.create({
          data: {
            doubtId: doubt.id,
            action: 'QUEUED',
            details: JSON.stringify({ reason: 'No eligible faculty available' })
          }
        })
      ]);
      return null;
    }
  }

  /**
   * Event-driven retry for all queued doubts in a department.
   * Call this when a faculty becomes available or their workload decreases.
   */
  static async retryQueuedDoubts(departmentId: string) {
    const queuedDoubts = await prisma.doubt.findMany({
      where: {
        departmentId,
        status: 'QUEUED'
      },
      orderBy: { createdAt: 'asc' } // Oldest first
    });

    for (const doubt of queuedDoubts) {
      await this.routeDoubt(doubt.id);
    }
  }
}
