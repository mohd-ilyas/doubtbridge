import { PrismaClient } from '../generated/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();
const demoPassword = process.env.DEMO_PASSWORD || 'password123';

type DepartmentSeed = {
  name: string;
  code: string;
  faculty: { name: string; email: string };
  student: { name: string; email: string };
  subjects: Array<{ name: string; topics: string[] }>;
};

const catalog: DepartmentSeed[] = [
  {
    name: 'Computer Science Engineering', code: 'CSE',
    faculty: { name: 'Dr. Sathish', email: 'sathish@doubtbridge.com' },
    student: { name: 'CSE Student', email: 'cse.student@doubtbridge.com' },
    subjects: [
      { name: 'Data Structures and Algorithms', topics: ['Arrays and Linked Lists', 'Trees and Graphs', 'Dynamic Programming'] },
      { name: 'Advanced Data Structures and Algorithms', topics: ['Segment Trees', 'Greedy Algorithms', 'Graph Algorithms'] },
      { name: 'Object-Oriented Programming', topics: ['Classes and Objects', 'Inheritance', 'Polymorphism'] },
      { name: 'Database Management Systems', topics: ['Normalization', 'SQL Queries', 'Transactions'] },
      { name: 'Operating Systems', topics: ['Processes and Threads', 'Scheduling', 'Memory Management'] },
      { name: 'Computer Networks', topics: ['OSI Model', 'TCP/IP', 'Routing'] },
    ],
  },
  {
    name: 'Electronics and Communication Engineering', code: 'ECE',
    faculty: { name: 'Dr. Sarath Kumar', email: 'sarath@doubtbridge.com' },
    student: { name: 'ECE Student', email: 'ece.student@doubtbridge.com' },
    subjects: [
      { name: 'Digital Electronics', topics: ['Logic Gates', 'Flip-Flops', 'Counters'] },
      { name: 'Signals and Systems', topics: ['Signal Classification', 'Convolution', 'Fourier Transform'] },
      { name: 'Analog Electronics', topics: ['Diodes', 'Transistors', 'Amplifiers'] },
      { name: 'Communication Systems', topics: ['Modulation', 'Noise', 'Bandwidth'] },
      { name: 'Microprocessors', topics: ['8086 Architecture', 'Instruction Set', 'Interfacing'] },
    ],
  },
  {
    name: 'Artificial Intelligence and Data Science', code: 'AI_DS',
    faculty: { name: 'Dr. Issac Newton', email: 'issac@doubtbridge.com' },
    student: { name: 'AI and DS Student', email: 'aids.student@doubtbridge.com' },
    subjects: [
      { name: 'Data Science', topics: ['Data Cleaning', 'Exploratory Analysis', 'Visualization'] },
      { name: 'Artificial Intelligence', topics: ['Search Algorithms', 'Knowledge Representation', 'Planning'] },
      { name: 'Python for Data Science', topics: ['NumPy', 'Pandas', 'Matplotlib'] },
      { name: 'Statistics for Data Science', topics: ['Probability', 'Hypothesis Testing', 'Regression'] },
      { name: 'Data Analytics', topics: ['Dashboards', 'KPIs', 'Business Analysis'] },
    ],
  },
  {
    name: 'Artificial Intelligence and Machine Learning', code: 'AI_ML',
    faculty: { name: 'Dr. Raayan Kumar', email: 'raayan@doubtbridge.com' },
    student: { name: 'AI and ML Student', email: 'aiml.student@doubtbridge.com' },
    subjects: [
      { name: 'Machine Learning', topics: ['Supervised Learning', 'Classification', 'Clustering'] },
      { name: 'Deep Learning', topics: ['Backpropagation', 'CNNs', 'RNNs'] },
      { name: 'Artificial Intelligence', topics: ['Intelligent Agents', 'Search', 'Reasoning'] },
      { name: 'Neural Networks', topics: ['Perceptrons', 'Activation Functions', 'Optimization'] },
      { name: 'Natural Language Processing', topics: ['Tokenization', 'Embeddings', 'Transformers'] },
    ],
  },
];

async function ensureSubject(departmentId: string, name: string) {
  const existing = await prisma.subject.findFirst({ where: { departmentId, name } });
  return existing ?? prisma.subject.create({ data: { departmentId, name } });
}

async function ensureTopic(subjectId: string, name: string) {
  const existing = await prisma.topic.findFirst({ where: { subjectId, name } });
  return existing ?? prisma.topic.create({ data: { subjectId, name } });
}

async function main() {
  const password = await bcrypt.hash(demoPassword, 10);
  await prisma.user.upsert({
    where: { email: 'admin@doubtbridge.com' },
    update: { name: 'System Admin', role: 'ADMIN', password },
    create: { email: 'admin@doubtbridge.com', password, name: 'System Admin', role: 'ADMIN' },
  });

  const now = new Date();
  const yearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const seededData: Record<string, { department: any; facultyUser: any; facultyProfile: any; studentUser: any; studentProfile: any; subjectsMap: Map<string, any> }> = {};

  for (const entry of catalog) {
    const existingDepartment = await prisma.department.findFirst({
      where: { OR: [{ code: entry.code }, { name: entry.name }] },
    });
    const department = existingDepartment
      ? await prisma.department.update({ where: { id: existingDepartment.id }, data: { name: entry.name, code: entry.code } })
      : await prisma.department.create({ data: { name: entry.name, code: entry.code } });

    const subjectsMap = new Map();
    const subjects = [];
    for (const item of entry.subjects) {
      const subject = await ensureSubject(department.id, item.name);
      const topics = await Promise.all(item.topics.map((topic) => ensureTopic(subject.id, topic)));
      subjects.push({ subject, topics });
      subjectsMap.set(item.name, { subject, topicsMap: new Map(topics.map(t => [t.name, t])) });
    }

    const facultyUser = await prisma.user.upsert({
      where: { email: entry.faculty.email },
      update: { name: entry.faculty.name, role: 'FACULTY', password },
      create: { email: entry.faculty.email, password, name: entry.faculty.name, role: 'FACULTY' },
    });
    const facultyProfile = await prisma.facultyProfile.upsert({
      where: { userId: facultyUser.id },
      update: { departmentId: department.id, maxWorkload: 10, availableFrom: now, availableUntil: yearFromNow },
      create: { userId: facultyUser.id, departmentId: department.id, maxWorkload: 10, availableFrom: now, availableUntil: yearFromNow },
    });

    for (const { subject, topics } of subjects) {
      await prisma.facultyExpertise.upsert({
        where: { facultyProfileId_subjectId: { facultyProfileId: facultyProfile.id, subjectId: subject.id } },
        update: {}, create: { facultyProfileId: facultyProfile.id, subjectId: subject.id },
      });
      for (const topic of topics) {
        await prisma.facultyTopicExpertise.upsert({
          where: { facultyProfileId_topicId: { facultyProfileId: facultyProfile.id, topicId: topic.id } },
          update: {}, create: { facultyProfileId: facultyProfile.id, topicId: topic.id },
        });
      }
    }

    const studentUser = await prisma.user.upsert({
      where: { email: entry.student.email },
      update: { name: entry.student.name, role: 'STUDENT', password },
      create: { email: entry.student.email, password, name: entry.student.name, role: 'STUDENT' },
    });
    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId: studentUser.id }, update: { departmentId: department.id },
      create: { userId: studentUser.id, departmentId: department.id },
    });

    seededData[entry.code] = { department, facultyUser, facultyProfile, studentUser, studentProfile, subjectsMap };
  }

  // Seed sample doubts across departments
  const cse = seededData['CSE'];
  if (cse) {
    const dsaSubject = cse.subjectsMap.get('Data Structures and Algorithms')?.subject;
    const treeTopic = cse.subjectsMap.get('Data Structures and Algorithms')?.topicsMap.get('Trees and Graphs');
    const osSubject = cse.subjectsMap.get('Operating Systems')?.subject;

    if (dsaSubject) {
      // 1. ANSWERED doubt
      const doubt1 = await prisma.doubt.create({
        data: {
          title: 'How to perform AVL Tree rotations?',
          description: 'I am getting confused between Left-Right (LR) and Right-Left (RL) rotations when rebalancing an AVL tree.',
          status: 'ANSWERED',
          studentId: cse.studentProfile.id,
          departmentId: cse.department.id,
          subjectId: dsaSubject.id,
          topicId: treeTopic?.id,
        }
      });
      await prisma.doubtAssignment.create({
        data: {
          doubtId: doubt1.id,
          facultyId: cse.facultyProfile.id,
          routingScore: 100,
          routingFactors: JSON.stringify({ departmentMatch: true, subjectMatch: true, topicMatch: true })
        }
      });
      await prisma.doubtResponse.create({
        data: {
          doubtId: doubt1.id,
          userId: cse.facultyUser.id,
          content: 'For an LR imbalance (inserted in left child right subtree), first do a left rotation on the left child, then a right rotation on the root.'
        }
      });

      // 2. IN_PROGRESS doubt
      const doubt2 = await prisma.doubt.create({
        data: {
          title: 'Dijkstra Algorithm edge weights constraint',
          description: 'Why does Dijkstra algorithm fail when negative edge weights are present in a graph?',
          status: 'IN_PROGRESS',
          studentId: cse.studentProfile.id,
          departmentId: cse.department.id,
          subjectId: dsaSubject.id,
          topicId: treeTopic?.id,
        }
      });
      await prisma.doubtAssignment.create({
        data: {
          doubtId: doubt2.id,
          facultyId: cse.facultyProfile.id,
          routingScore: 95,
          routingFactors: JSON.stringify({ departmentMatch: true, subjectMatch: true })
        }
      });
    }

    if (osSubject) {
      // 3. RESOLVED doubt
      const doubt3 = await prisma.doubt.create({
        data: {
          title: 'Difference between Process and Thread',
          description: 'Can someone explain context switching overhead difference between process and thread?',
          status: 'RESOLVED',
          studentId: cse.studentProfile.id,
          departmentId: cse.department.id,
          subjectId: osSubject.id,
        }
      });
      await prisma.doubtAssignment.create({
        data: {
          doubtId: doubt3.id,
          facultyId: cse.facultyProfile.id,
          routingScore: 90,
          routingFactors: JSON.stringify({ departmentMatch: true, subjectMatch: true })
        }
      });
      await prisma.doubtResponse.create({
        data: {
          doubtId: doubt3.id,
          userId: cse.facultyUser.id,
          content: 'Threads share the same virtual address space, memory, and code section. Switching between threads of the same process avoids flushing TLB caches.'
        }
      });
    }
  }

  const ece = seededData['ECE'];
  if (ece) {
    const digitalSubject = ece.subjectsMap.get('Digital Electronics')?.subject;
    if (digitalSubject) {
      const doubt4 = await prisma.doubt.create({
        data: {
          title: 'Synchronous Counter propagation delay',
          description: 'How does synchronous counter eliminate the propagation delay accumulated in ripple counters?',
          status: 'ASSIGNED',
          studentId: ece.studentProfile.id,
          departmentId: ece.department.id,
          subjectId: digitalSubject.id,
        }
      });
      await prisma.doubtAssignment.create({
        data: {
          doubtId: doubt4.id,
          facultyId: ece.facultyProfile.id,
          routingScore: 100,
          routingFactors: JSON.stringify({ departmentMatch: true, subjectMatch: true })
        }
      });
    }
  }

  const aids = seededData['AI_DS'];
  if (aids) {
    const dsSubject = aids.subjectsMap.get('Data Science')?.subject;
    if (dsSubject) {
      await prisma.doubt.create({
        data: {
          title: 'Handling missing values in large datasets',
          description: 'Should we use mean/median imputation or KNN imputation when dealing with non-random missing values?',
          status: 'SUBMITTED',
          studentId: aids.studentProfile.id,
          departmentId: aids.department.id,
          subjectId: dsSubject.id,
        }
      });
    }
  }

  console.log('Seeded 4 departments, 4 faculty members, 4 students, and realistic doubt workflow samples.');
  console.log(`All demo accounts use password: ${demoPassword}`);
}

main().catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => prisma.$disconnect());
