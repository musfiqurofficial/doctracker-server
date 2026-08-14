import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} from '../controllers/doctor.controller';

const router = Router();

router.route('/')
  .get(getDoctors)
  .post(createDoctor);

router.route('/:id')
  .get(getDoctorById)
  .put(updateDoctor)
  .delete(deleteDoctor);

router.get('/:id/patients', getDoctorPatients);

export default router;
