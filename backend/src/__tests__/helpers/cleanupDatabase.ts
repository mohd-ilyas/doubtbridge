import prisma from '../../prisma';

export async function cleanupDatabase() {
  // Delete child records first
  await prisma.activityLog.deleteMany({});
  await prisma.doubtResponse.deleteMany({});
  await prisma.doubtAssignment.deleteMany({});
  await prisma.doubt.deleteMany({});

  await prisma.facultyTopicExpertise.deleteMany({});
  await prisma.facultyExpertise.deleteMany({});
  await prisma.availabilitySlot.deleteMany({});

  await prisma.studentProfile.deleteMany({});
  await prisma.facultyProfile.deleteMany({});

  await prisma.topic.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.department.deleteMany({});

  await prisma.user.deleteMany({});
}
