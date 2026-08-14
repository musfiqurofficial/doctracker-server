import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { createDoctorSchema, updateDoctorSchema } from '../validators/doctor.validator';
import { emitNotification } from '../socket';

export const getDoctors = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string || '').trim();
  const specialty = (req.query.specialty as string || '').trim();
  const department = (req.query.department as string || '').trim();
  const status = (req.query.status as string || '').trim();

  const filterQuery: any = {};

  if (search) {
    filterQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (specialty && specialty !== 'all') {
    filterQuery.specialty = { $regex: specialty, $options: 'i' };
  }

  if (department && department !== 'all') {
    filterQuery.department = { $regex: department, $options: 'i' };
  }

  if (status && status !== 'all') {
    filterQuery.availabilityStatus = status;
  }

  const total = await Doctor.countDocuments(filterQuery);
  const totalPages = Math.ceil(total / limit) || 1;

  const doctors = await Doctor.find(filterQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Get patient count for each doctor in single query
  const doctorIds = doctors.map((d) => d._id);
  const patientCounts = await Patient.aggregate([
    { $match: { doctorId: { $in: doctorIds } } },
    { $group: { _id: '$doctorId', count: { $sum: 1 } } },
  ]);

  const patientCountMap = new Map(patientCounts.map((pc) => [pc._id.toString(), pc.count]));

  const doctorsWithPatientCounts = doctors.map((doc) => ({
    ...doc.toObject(),
    patientsCount: patientCountMap.get(doc._id.toString()) || 0,
  }));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Doctors fetched successfully',
    data: doctorsWithPatientCounts,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

export const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const patientsCount = await Patient.countDocuments({ doctorId: id });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Doctor details retrieved successfully',
    data: {
      ...doctor.toObject(),
      patientsCount,
    },
  });
});

export const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const validatedData = createDoctorSchema.parse(req.body);

  const existingDoctor = await Doctor.findOne({ email: validatedData.email.toLowerCase() });
  if (existingDoctor) {
    throw new ApiError(400, 'A doctor with this email address already exists.');
  }

  const newDoctor = await Doctor.create({
    ...validatedData,
    email: validatedData.email.toLowerCase(),
  });

  emitNotification({
    title: 'Doctor Registered',
    message: `Dr. ${newDoctor.name} was registered in ${newDoctor.department}.`,
    type: 'success',
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Doctor registered successfully',
    data: newDoctor,
  });
});

export const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updateDoctorSchema.parse(req.body);

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (validatedData.email && validatedData.email.toLowerCase() !== doctor.email) {
    const existingDoctor = await Doctor.findOne({ email: validatedData.email.toLowerCase() });
    if (existingDoctor) {
      throw new ApiError(400, 'Email address is already in use by another doctor.');
    }
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    id,
    {
      ...validatedData,
      ...(validatedData.email && { email: validatedData.email.toLowerCase() }),
    },
    { new: true, runValidators: true }
  );

  emitNotification({
    title: 'Doctor Profile Updated',
    message: `Dr. ${updatedDoctor?.name}'s information was updated.`,
    type: 'info',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Doctor profile updated successfully',
    data: updatedDoctor,
  });
});

export const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // Cascade delete assigned patients
  await Patient.deleteMany({ doctorId: id });
  await Doctor.findByIdAndDelete(id);

  emitNotification({
    title: 'Doctor Removed',
    message: `Dr. ${doctor.name} was removed from the system.`,
    type: 'destructive',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Doctor and associated records deleted successfully',
    data: { id },
  });
});

export const getDoctorPatients = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const total = await Patient.countDocuments({ doctorId: id });
  const patients = await Patient.find({ doctorId: id })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Assigned patients retrieved successfully',
    data: patients,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});
