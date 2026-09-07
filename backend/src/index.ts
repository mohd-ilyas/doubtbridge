import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import academicRoutes from './routes/academicRoutes';
import adminRoutes from './routes/adminRoutes';
import facultyRoutes from './routes/facultyRoutes';
import doubtRoutes from './routes/doubtRoutes';

export const app = express();

app.use(helmet());
const frontendOrigin = env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use('/auth', authRoutes);
app.use('/api', academicRoutes);
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/doubts', doubtRoutes);

app.use(errorHandler);

const PORT = Number(env.PORT) || 5000;
if (process.env.NODE_ENV !== 'test') app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

export default app;
