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
      {
        name: 'Data Structures and Algorithms',
        topics: [
          'Arrays and Linked Lists',
          'Trees and Graphs',
          'Dynamic Programming',
          'Stacks and Queues',
          'Hash Tables and Searching',
          'Sorting Algorithms'
        ]
      },
      {
        name: 'Advanced Data Structures and Algorithms',
        topics: [
          'Segment Trees',
          'Greedy Algorithms',
          'Graph Algorithms',
          'Disjoint Set Union (DSU)',
          'Tries and String Matching',
          'Network Flow and Max Flow'
        ]
      },
      {
        name: 'Object-Oriented Programming',
        topics: [
          'Classes and Objects',
          'Inheritance and Interfaces',
          'Polymorphism and Overloading',
          'Abstraction and Encapsulation',
          'Exception Handling',
          'Design Patterns'
        ]
      },
      {
        name: 'Database Management Systems',
        topics: [
          'Normalization and Database Design',
          'SQL Queries and Joins',
          'Transactions and Concurrency Control',
          'Indexing and B-Trees',
          'Entity-Relationship (ER) Modeling',
          'NoSQL and Distributed Databases'
        ]
      },
      {
        name: 'Operating Systems',
        topics: [
          'Processes and Threads',
          'CPU Scheduling Algorithms',
          'Memory Management and Virtual Memory',
          'Deadlocks and Synchronization',
          'File System Interface and Implementation',
          'Virtualization and Containers'
        ]
      },
      {
        name: 'Computer Networks',
        topics: [
          'OSI Model and Layer Architecture',
          'TCP/IP Protocol Suite',
          'Routing Algorithms (OSPF, BGP)',
          'IP Addressing, Subnetting, and CIDR',
          'DNS, DHCP, and HTTP/HTTPS Protocols',
          'Network Security, Firewalls, and Cryptography',
          'Wireless, Mobile, and Socket Programming'
        ]
      },
    ],
  },
  {
    name: 'Electronics and Communication Engineering', code: 'ECE',
    faculty: { name: 'Dr. Sarath Kumar', email: 'sarath@doubtbridge.com' },
    student: { name: 'ECE Student', email: 'ece.student@doubtbridge.com' },
    subjects: [
      {
        name: 'Digital Electronics',
        topics: [
          'Logic Gates & Boolean Algebra',
          'Flip-Flops & Latches',
          'Synchronous & Asynchronous Counters',
          'Combinational Circuits (Mux, Demux)',
          'Shift Registers'
        ]
      },
      {
        name: 'Signals and Systems',
        topics: [
          'Signal Classification & Properties',
          'Continuous & Discrete Convolution',
          'Fourier Series & Transform',
          'Laplace & Z-Transform',
          'Sampling Theorem'
        ]
      },
      {
        name: 'Analog Electronics',
        topics: [
          'Diodes & Rectifier Circuits',
          'BJT and MOSFET Transistors',
          'Operational Amplifiers (Op-Amps)',
          'Feedback Amplifiers & Oscillators',
          'Power Amplifiers'
        ]
      },
      {
        name: 'Communication Systems',
        topics: [
          'Amplitude & Frequency Modulation (AM/FM)',
          'Digital Modulation (ASK, FSK, PSK)',
          'Noise Analysis & SNR',
          'Information Theory & Channel Capacity',
          'Antennas & Wave Propagation'
        ]
      },
      {
        name: 'Microprocessors',
        topics: [
          '8086 Microprocessor Architecture',
          'Assembly Language Instruction Set',
          'Memory & Peripheral Interfacing',
          'Interrupt Processing',
          'ARM Microcontroller Basics'
        ]
      },
    ],
  },
  {
    name: 'Mechanical Engineering', code: 'MECH',
    faculty: { name: 'Dr. Vikram Ramesh', email: 'vikram@doubtbridge.com' },
    student: { name: 'MECH Student', email: 'mech.student@doubtbridge.com' },
    subjects: [
      {
        name: 'Thermodynamics',
        topics: [
          'First and Second Laws of Thermodynamics',
          'Entropy and Availability Analysis',
          'Gas Power Cycles (Otto, Diesel, Dual)',
          'Vapor Power Cycles (Rankine Cycle)',
          'Refrigeration and Psychrometrics'
        ]
      },
      {
        name: 'Fluid Mechanics',
        topics: [
          'Fluid Statics and Pressure Measurement',
          'Bernoulli Equation & Fluid Kinematics',
          'Viscous Flow in Pipes and Friction Factor',
          'Dimensional Analysis and Similitude',
          'Hydraulic Turbines and Pumps'
        ]
      },
      {
        name: 'Strength of Materials',
        topics: [
          'Stress, Strain, and Elastic Constants',
          'Bending Moment and Shear Force Diagrams',
          'Torsion of Circular Shafts',
          'Deflection of Beams',
          'Columns and Thin Cylinders'
        ]
      },
      {
        name: 'Manufacturing Technology',
        topics: [
          'Metal Casting and Pattern Design',
          'Welding Processes and Defect Analysis',
          'Metal Cutting Dynamics and Lathe Machine',
          'CNC Machining and Programming',
          'Unconventional Machining (EDM, ECM)'
        ]
      },
      {
        name: 'Engineering Mechanics',
        topics: [
          'Statics of Particles and Free Body Diagrams',
          'Equilibrium of Rigid Bodies and Trusses',
          'Friction and Wedge Mechanics',
          'Kinematics and Kinetics of Particles',
          'Centroid and Moment of Inertia'
        ]
      },
    ],
  },
  {
    name: 'Artificial Intelligence and Data Science', code: 'AI_DS',
    faculty: { name: 'Dr. Issac Newton', email: 'issac@doubtbridge.com' },
    student: { name: 'AI and DS Student', email: 'aids.student@doubtbridge.com' },
    subjects: [
      {
        name: 'Data Science',
        topics: [
          'Data Cleaning & Preprocessing',
          'Exploratory Data Analysis (EDA)',
          'Data Visualization & Storytelling',
          'Feature Engineering & Selection',
          'Dimensionality Reduction (PCA)'
        ]
      },
      {
        name: 'Artificial Intelligence',
        topics: [
          'Search Algorithms (A*, BFS, DFS)',
          'Knowledge Representation & Logic',
          'Constraint Satisfaction Problems',
          'Adversarial Search & Game Playing',
          'Expert Systems'
        ]
      },
      {
        name: 'Python for Data Science',
        topics: [
          'NumPy Arrays & Numerical Ops',
          'Pandas DataFrames & Manipulation',
          'Matplotlib & Seaborn Visualization',
          'Scikit-Learn ML Pipelines',
          'Jupyter Notebook Workflows'
        ]
      },
      {
        name: 'Statistics for Data Science',
        topics: [
          'Probability Distributions',
          'Hypothesis Testing & p-values',
          'Linear & Logistic Regression',
          'ANOVA and Chi-Square Tests',
          'Bayesian Inference'
        ]
      },
      {
        name: 'Data Analytics',
        topics: [
          'Business Intelligence & KPIs',
          'Interactive Dashboards',
          'A/B Testing & Experimentation',
          'Time Series Analysis & Forecasting',
          'SQL for Business Analytics'
        ]
      },
    ],
  },
  {
    name: 'Artificial Intelligence and Machine Learning', code: 'AI_ML',
    faculty: { name: 'Dr. Raayan Kumar', email: 'raayan@doubtbridge.com' },
    student: { name: 'AI and ML Student', email: 'aiml.student@doubtbridge.com' },
    subjects: [
      {
        name: 'Machine Learning',
        topics: [
          'Supervised Learning Algorithms',
          'Classification & Decision Trees',
          'Clustering Algorithms (K-Means)',
          'Ensemble Methods (Random Forest, XGBoost)',
          'Hyperparameter Tuning'
        ]
      },
      {
        name: 'Deep Learning',
        topics: [
          'Forward and Backpropagation',
          'Convolutional Neural Networks (CNNs)',
          'Recurrent Neural Networks (RNNs & LSTMs)',
          'Generative Adversarial Networks (GANs)',
          'Transformers & Attention Mechanisms'
        ]
      },
      {
        name: 'Artificial Intelligence',
        topics: [
          'Intelligent Autonomous Agents',
          'State-Space Search & Heuristics',
          'Probabilistic Reasoning',
          'Reinforcement Learning Basics',
          'Ethics & Safety in AI'
        ]
      },
      {
        name: 'Neural Networks',
        topics: [
          'Perceptrons & MLPs',
          'Activation Functions (ReLU, Softmax)',
          'Optimization Algorithms (SGD, Adam)',
          'Regularization & Dropout',
          'Transfer Learning'
        ]
      },
      {
        name: 'Natural Language Processing',
        topics: [
          'Text Preprocessing & Tokenization',
          'Word Embeddings (Word2Vec)',
          'Sequence-to-Sequence Models',
          'Large Language Models (LLMs)',
          'Sentiment Analysis & NER'
        ]
      },
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
    const cnSubject = cse.subjectsMap.get('Computer Networks')?.subject;
    const osiTopic = cse.subjectsMap.get('Computer Networks')?.topicsMap.get('OSI Model and Layer Architecture');

    if (dsaSubject) {
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

    if (cnSubject) {
      const doubtCN = await prisma.doubt.create({
        data: {
          title: 'Difference between TCP 3-way handshake and UDP connection',
          description: 'How does TCP guarantee reliability during the SYN, SYN-ACK, and ACK handshake sequence?',
          status: 'ANSWERED',
          studentId: cse.studentProfile.id,
          departmentId: cse.department.id,
          subjectId: cnSubject.id,
          topicId: osiTopic?.id,
        }
      });
      await prisma.doubtAssignment.create({
        data: {
          doubtId: doubtCN.id,
          facultyId: cse.facultyProfile.id,
          routingScore: 100,
          routingFactors: JSON.stringify({ departmentMatch: true, subjectMatch: true, topicMatch: true })
        }
      });
      await prisma.doubtResponse.create({
        data: {
          doubtId: doubtCN.id,
          userId: cse.facultyUser.id,
          content: 'TCP uses sequence numbers and acknowledgment numbers during the 3-way handshake to establish initial sequence numbers (ISN) and ensure both sender and receiver are synchronized.'
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

  const mech = seededData['MECH'];
  if (mech) {
    const thermoSubject = mech.subjectsMap.get('Thermodynamics')?.subject;
    if (thermoSubject) {
      await prisma.doubt.create({
        data: {
          title: 'Second Law of Thermodynamics vs Carnot Efficiency',
          description: 'Why can no real heat engine achieve 100% thermal efficiency even under ideal reversible conditions?',
          status: 'SUBMITTED',
          studentId: mech.studentProfile.id,
          departmentId: mech.department.id,
          subjectId: thermoSubject.id,
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

  console.log('Seeded 5 departments (CSE, ECE, MECH, AI_DS, AI_ML), faculty members, students, and sample doubts.');
  console.log(`All demo accounts use password: ${demoPassword}`);
}

main().catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => prisma.$disconnect());
