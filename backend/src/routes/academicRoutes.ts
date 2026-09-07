import { Router } from 'express';
import { getDepartments, createDepartment, getSubjects, createSubject, getTopics, createTopic } from '../controllers/academicController';
import { validate } from '../middlewares/validate';
import { createDepartmentSchema, createSubjectSchema, createTopicSchema } from '../validators/academicValidators';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new department
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/departments', getDepartments);
router.post('/departments', authenticate, authorize('ADMIN'), validate(createDepartmentSchema), createDepartment);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new subject
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               departmentId: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/subjects', getSubjects);
router.post('/subjects', authenticate, authorize('ADMIN'), validate(createSubjectSchema), createSubject);

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new topic
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               subjectId: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/topics', getTopics);
router.post('/topics', authenticate, authorize('ADMIN'), validate(createTopicSchema), createTopic);

export default router;
