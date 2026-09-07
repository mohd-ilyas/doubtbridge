import { Router } from 'express';
import { createFaculty, getDashboardStats } from '../controllers/adminController';
import { validate } from '../middlewares/validate';
import { createFacultySchema } from '../validators/adminValidators';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /admin/faculty:
 *   post:
 *     summary: Create a new faculty member
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               departmentId: { type: string }
 *               maxWorkload: { type: number }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/faculty', validate(createFacultySchema), createFaculty);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/dashboard', getDashboardStats);

export default router;
