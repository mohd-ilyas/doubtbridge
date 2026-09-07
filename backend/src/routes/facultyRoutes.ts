import { Router } from 'express';
import { setAvailability, addExpertise } from '../controllers/facultyController';
import { getAssignedDoubts, acceptDoubt, respondToDoubt, transferDoubt, startWorkingOnDoubt } from '../controllers/facultyDoubtController';
import { validate } from '../middlewares/validate';
import { setAvailabilitySchema, addExpertiseSchema } from '../validators/facultyValidators';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize('FACULTY'));

/**
 * @swagger
 * /faculty/availability:
 *   patch:
 *     summary: Set faculty availability
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/availability', validate(setAvailabilitySchema), setAvailability);

/**
 * @swagger
 * /faculty/expertise:
 *   post:
 *     summary: Add an expertise topic
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/expertise', validate(addExpertiseSchema), addExpertise);

/**
 * @swagger
 * /faculty/doubts:
 *   get:
 *     summary: Get doubts assigned to the faculty
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
/**
 * @swagger
 * /faculty/doubts:
 *   get:
 *     summary: Get doubts assigned to the authenticated faculty member
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not a faculty member)
 */
router.get('/doubts', getAssignedDoubts);

/**
 * @swagger
 * /faculty/doubts/{id}/accept:
 *   post:
 *     summary: Accept an assigned doubt
 *     tags: [Faculty]
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
 *         description: Success
 */
router.post('/doubts/:id/accept', acceptDoubt);

/**
 * @swagger
 * /faculty/doubts/{id}/start:
 *   post:
 *     summary: Start working on an accepted doubt
 *     tags: [Faculty]
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
 *         description: Success
 */
router.post('/doubts/:id/start', startWorkingOnDoubt);

/**
 * @swagger
 * /faculty/doubts/{id}/respond:
 *   post:
 *     summary: Respond to an IN_PROGRESS doubt
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/doubts/:id/respond', respondToDoubt);

/**
 * @swagger
 * /faculty/doubts/{id}/transfer:
 *   post:
 *     summary: Transfer an assigned or accepted doubt back to the queue
 *     tags: [Faculty]
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
 *         description: Success
 */
router.post('/doubts/:id/transfer', transferDoubt);

export default router;
