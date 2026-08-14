import { Router } from 'express';
import authRoutes from './auth.routes';
import doctorRoutes from './doctor.routes';
import patientRoutes from './patient.routes';
import dashboardRoutes from './dashboard.routes';
import { emitNotification } from '../socket';
import { runSeeding } from '../utils/seeder';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Doctor Tracker API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// Database Seed API Endpoint (Triggers Seeding for Vercel/Production)
router.get('/seed', async (req, res, next) => {
  try {
    const result = await runSeeding();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Database Seeding Completed Successfully!',
      data: {
        adminEmail: result.adminEmail,
        seededDoctorsCount: result.doctorsCount,
        seededPatientsCount: result.patientsCount,
        defaultAdminPassword: 'AdminSecretPassword123!',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Test Notification Trigger endpoint
router.post('/notifications/test', (req, res) => {
  const { title, message, type } = req.body;

  emitNotification({
    title: title || 'Test System Alert',
    message: message || 'Real-time WebSocket notification received from Doctor Tracker backend server.',
    type: type || 'info',
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Notification emitted via Socket.io successfully',
  });
});

// Auth Routes
router.use('/auth', authRoutes);

// Doctor Routes
router.use('/doctors', doctorRoutes);

// Patient Routes
router.use('/patients', patientRoutes);

// Dashboard Routes
router.use('/dashboard', dashboardRoutes);

export default router;
