import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller';
import {
  createPatientValidationSchema,
  updatePatientValidationSchema,
} from '../validators/patient.validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';

const router = Router();

// Protect all patient routes with auth middleware
router.use(auth);

router
  .route('/')
  .post(validate(createPatientValidationSchema), createPatient)
  .get(getPatients);

router
  .route('/:id')
  .get(getPatientById)
  .put(validate(updatePatientValidationSchema), updatePatient)
  .delete(deletePatient);

export default router;
