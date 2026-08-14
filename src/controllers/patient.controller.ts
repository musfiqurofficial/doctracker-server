import { Request, Response } from 'express';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { emitNotification } from '../socket';

export const createPatient = catchAsync(async (req: Request, res: Response) => {
  const { doctorId } = req.body;

  // Verify assigned Doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Assigned Doctor not found');
  }

  const patient = await Patient.create(req.body);

  // Increment doctor's patient count
  await Doctor.findByIdAndUpdate(doctorId, { $inc: { patientsCount: 1 } });

  // Emit real-time WebSocket notification
  emitNotification({
    title: 'Patient Registered',
    message: `${patient.name} (${patient.condition}) was registered and assigned to Dr. ${doctor.name}.`,
    type: 'info',
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Patient created successfully',
    data: patient,
  });
});

export const getPatients = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, condition, status, doctorId } = req.query;

  // Build MongoDB query
  const query: Record<string, any> = {};

  if (search) {
    const searchRegex = new RegExp(String(search), 'i');
    query.$or = [{ name: searchRegex }, { condition: searchRegex }];
  }

  if (condition && condition !== 'all') {
    query.condition = new RegExp(String(condition), 'i');
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (doctorId) {
    query.doctorId = doctorId;
  }

  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query)
    .populate('doctorId', 'name specialty email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Patients retrieved successfully',
    data: {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      patients,
    },
  });
});

export const getPatientById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await Patient.findById(id).populate('doctorId', 'name specialty email phone');

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Patient details retrieved',
    data: patient,
  });
});

export const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const oldPatient = await Patient.findById(id);

  if (!oldPatient) {
    throw new ApiError(404, 'Patient not found');
  }

  // Handle doctor reassignment if doctorId is updated
  if (req.body.doctorId && String(req.body.doctorId) !== String(oldPatient.doctorId)) {
    const newDoctor = await Doctor.findById(req.body.doctorId);
    if (!newDoctor) {
      throw new ApiError(404, 'New assigned Doctor not found');
    }

    // Decrement old doctor count, increment new doctor count
    await Doctor.findByIdAndUpdate(oldPatient.doctorId, { $inc: { patientsCount: -1 } });
    await Doctor.findByIdAndUpdate(req.body.doctorId, { $inc: { patientsCount: 1 } });
  }

  const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate('doctorId', 'name specialty email');

  // Emit real-time WebSocket notification
  emitNotification({
    title: 'Patient Record Updated',
    message: `${updatedPatient?.name}'s medical record was updated.`,
    type: 'info',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

export const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await Patient.findById(id);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  await Patient.findByIdAndDelete(id);

  // Decrement doctor's patient count
  await Doctor.findByIdAndUpdate(patient.doctorId, { $inc: { patientsCount: -1 } });

  // Emit real-time WebSocket notification
  emitNotification({
    title: 'Patient Record Removed',
    message: `Patient ${patient.name}'s record was removed.`,
    type: 'warning',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Patient deleted successfully',
  });
});
