import { Router } from 'express';
import { submitDoubt, getStudentDoubts } from '../controllers/doubtController';
import { resolveDoubt, reopenDoubt, closeDoubt } from '../controllers/studentDoubtController';
import { validate } from '../middlewares/validate';
import { submitDoubtSchema } from '../validators/doubtValidators';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// Students
/**
 * @swagger
 * /doubts:
 *   post:
 *     summary: Submit a new doubt
 *     tags: [Doubts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, departmentId, subjectId]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               departmentId: { type: string }
 *               subjectId: { type: string }
 *               topicId: { type: string }
 *     responses:
 *       201:
 *         description: Doubt submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Student profile not found
 */
router.post('/', authorize('STUDENT'), validate(submitDoubtSchema), submitDoubt);

/**
 * @swagger
 * /doubts/student:
 *   get:
 *     summary: Get all doubts submitted by the current student
 *     tags: [Doubts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/student', authorize('STUDENT'), getStudentDoubts);

/**
 * @swagger
 * /doubts/{id}/resolve:
 *   post:
 *     summary: Mark an answered doubt as resolved
 *     tags: [Doubts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully resolved
 *       400:
 *         description: Doubt not answered
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Doubt not found
 */
router.post('/:id/resolve', authorize('STUDENT'), resolveDoubt);

/**
 * @swagger
 * /doubts/{id}/reopen:
 *   post:
 *     summary: Reopen a resolved or answered doubt
 *     tags: [Doubts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully reopened
 */
router.post('/:id/reopen', authorize('STUDENT'), reopenDoubt);

/**
 * @swagger
 * /doubts/{id}/close:
 *   post:
 *     summary: Close a resolved doubt
 *     tags: [Doubts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully closed
 */
router.post('/:id/close', authorize('STUDENT', 'ADMIN'), closeDoubt);

export default router;
