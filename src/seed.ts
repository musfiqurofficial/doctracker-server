import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import { Admin } from './models/Admin';
import { Doctor } from './models/Doctor';
import { Patient } from './models/Patient';

const MALE_FIRST_NAMES = [
  'Rahim', 'Karim', 'Tanvir', 'Mahmud', 'Rafiqul', 'Shahriar', 'Kazi', 'Mobarak',
  'Kamrul', 'Tariqul', 'Imtiaz', 'Zahid', 'Ariful', 'Mustafizur', 'Sajjad', 'Asif',
  'Nayeem', 'Habibur', 'Jahangir', 'Sultan', 'Mamun', 'Firoz', 'Mehedi', 'Anwar',
  'Delwar', 'Shakil', 'Fahim', 'Naimur', 'Robiul', 'Towhid', 'Mokbul', 'Biplob',
  'Saiful', 'Jamil', 'Zubair'
];

const FEMALE_FIRST_NAMES = [
  'Sarah', 'Nusrat', 'Farhana', 'Tahmina', 'Syeda', 'Sharmin', 'Sabrina', 'Roksana',
  'Tasnim', 'Fahmida', 'Sultana', 'Laila', 'Nigar', 'Afroza', 'Nazia', 'Shaila',
  'Meherun', 'Samia', 'Sadia', 'Shahnaz', 'Jesmin', 'Nasrin', 'Rehana', 'Sultana',
  'Kaniz', 'Farida', 'Rowshan', 'Mahbuba', 'Nahid', 'Rozina'
];

const LAST_NAMES = [
  'Khan', 'Ahmed', 'Hasan', 'Jahan', 'Islam', 'Chowdhury', 'Rahman', 'Alam',
  'Yeasmin', 'Naima', 'Hossain', 'Akter', 'Bhuiyan', 'Siddique', 'Khatun', 'Parveen',
  'Begum', 'Mia', 'Ali', 'Kabir', 'Uddin', 'Mahmood', 'Haque', 'Sarkar', 'Biswas',
  'Miah', 'Talukder', 'Laskar', 'Mazumder', 'Dewan'
];

const SPECIALTIES = [
  { name: 'Cardiology', dept: 'Cardiology', qual: 'MBBS, FCPS (Cardiology)', fee: 1500 },
  { name: 'Neurology', dept: 'Neurology', qual: 'MBBS, MD (Neurology)', fee: 1200 },
  { name: 'Orthopedics', dept: 'Orthopedics', qual: 'MBBS, MS (Orthopedics)', fee: 1400 },
  { name: 'Pediatrics', dept: 'Pediatrics', qual: 'MBBS, DCH, FCPS (Pediatrics)', fee: 1000 },
  { name: 'General Medicine', dept: 'General Medicine', qual: 'MBBS, FCPS (Medicine)', fee: 800 },
  { name: 'Dermatology', dept: 'Dermatology', qual: 'MBBS, DDV, FCPS', fee: 1000 },
  { name: 'Gastroenterology', dept: 'Gastroenterology', qual: 'MBBS, MD (Gastroenterology)', fee: 1300 },
  { name: 'Endocrinology', dept: 'Endocrinology', qual: 'MBBS, MD (Endocrinology)', fee: 1200 },
  { name: 'Nephrology', dept: 'Nephrology', qual: 'MBBS, MD (Nephrology)', fee: 1300 },
  { name: 'Pulmonology', dept: 'Pulmonology', qual: 'MBBS, DTCD, MD', fee: 1100 },
  { name: 'Gynecology & Obstetrics', dept: 'Gynecology', qual: 'MBBS, FCPS (OBGYN)', fee: 1200 },
  { name: 'Ophthalmology', dept: 'Ophthalmology', qual: 'MBBS, DO, FCPS', fee: 900 },
  { name: 'ENT', dept: 'Ear Nose Throat', qual: 'MBBS, DLO, MS', fee: 1000 },
  { name: 'Psychiatry', dept: 'Psychiatry', qual: 'MBBS, MPhil, FCPS (Psychiatry)', fee: 1100 },
  { name: 'Urology', dept: 'Urology', qual: 'MBBS, MS (Urology)', fee: 1400 },
];

const CONDITIONS = [
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Acute Bronchial Asthma',
  'Coronary Artery Disease',
  'Migraine with Aura',
  'Osteoarthritis of Knee',
  'Chronic Gastritis & GERD',
  'Atopic Dermatitis',
  'Community Acquired Pneumonia',
  'Renal Calculi (Kidney Stones)',
  'Generalized Anxiety Disorder',
  'Hypothyroidism',
  'Lumbar Disc Prolapse',
  'Refractive Error / Myopia',
  'Chronic Otitis Media',
  'Benign Prostatic Hyperplasia',
  'Fatty Liver Disease',
  'Iron Deficiency Anemia',
  'Viral Fever & Dengue',
  'Allergic Rhinitis'
];

const AVAILABILITY_STATUSES: Array<'Available' | 'On Leave' | 'Busy'> = ['Available', 'Available', 'Available', 'Busy', 'On Leave'];
const PATIENT_STATUSES: Array<'stable' | 'recovering' | 'critical'> = ['stable', 'stable', 'stable', 'recovering', 'recovering', 'critical'];
const GENDERS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Other'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysBack: number): Date {
  const date = new Date();
  const diffDays = Math.floor(Math.random() * daysBack);
  const diffHours = Math.floor(Math.random() * 24);
  const diffMins = Math.floor(Math.random() * 60);
  date.setDate(date.getDate() - diffDays);
  date.setHours(date.getHours() - diffHours, date.getMinutes() - diffMins);
  return date;
}

async function seedData() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.DATABASE_URL);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Admin User
    const adminEmail = env.ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log(`[Seed] Creating admin user (${adminEmail})...`);
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`[Seed] Admin user (${adminEmail}) successfully seeded!`);
    } else {
      console.log(`[Seed] Admin user (${adminEmail}) already exists.`);
    }

    // 2. Clear old Doctors & Patients data to guarantee exact counts
    console.log('[Seed] Clearing existing Doctors and Patients collections...');
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    console.log('[Seed] Cleared old Doctor and Patient records.');

    // 3. Generate 50 Doctors
    console.log('[Seed] Generating 50 Doctors...');
    const doctorsData = [];
    const usedEmails = new Set<string>();

    for (let i = 1; i <= 50; i++) {
      const isMale = Math.random() > 0.4;
      const firstName = isMale ? getRandomItem(MALE_FIRST_NAMES) : getRandomItem(FEMALE_FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const title = 'Dr.';
      const name = `${title} ${firstName} ${lastName}`;

      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@doctracker.com`;
      if (usedEmails.has(email)) {
        email = `doctor${i}@doctracker.com`;
      }
      usedEmails.add(email);

      const spec = getRandomItem(SPECIALTIES);
      const phone = `+880 1${getRandomInt(3, 9)}${getRandomInt(1000000, 9999999)}`;
      const experienceYears = getRandomInt(2, 28);
      const consultationFee = spec.fee + (getRandomInt(0, 4) * 100);
      const availabilityStatus = getRandomItem(AVAILABILITY_STATUSES);
      const bio = `Experienced ${spec.name} specialist with over ${experienceYears} years of clinical practice in modern healthcare.`;

      doctorsData.push({
        name,
        email,
        phone,
        specialty: spec.name,
        department: spec.dept,
        qualification: spec.qual,
        experienceYears,
        consultationFee,
        availabilityStatus,
        bio,
      });
    }

    const createdDoctors = await Doctor.insertMany(doctorsData);
    console.log(`[Seed] Successfully seeded ${createdDoctors.length} doctors!`);

    // 4. Generate 500 Patients
    console.log('[Seed] Generating 500 Patients...');
    const patientsData = [];

    for (let i = 1; i <= 500; i++) {
      const gender = getRandomItem(GENDERS);
      let firstName: string;
      if (gender === 'Male') {
        firstName = getRandomItem(MALE_FIRST_NAMES);
      } else if (gender === 'Female') {
        firstName = getRandomItem(FEMALE_FIRST_NAMES);
      } else {
        firstName = getRandomItem([...MALE_FIRST_NAMES, ...FEMALE_FIRST_NAMES]);
      }
      const lastName = getRandomItem(LAST_NAMES);
      const name = `${firstName} ${lastName}`;

      const age = getRandomInt(3, 85);
      const condition = getRandomItem(CONDITIONS);
      const status = getRandomItem(PATIENT_STATUSES);
      const assignedDoctor = getRandomItem(createdDoctors);
      const visitDate = getRandomDate(90);

      patientsData.push({
        name,
        age,
        gender,
        condition,
        status,
        doctorId: assignedDoctor._id,
        visitDate,
      });
    }

    const createdPatients = await Patient.insertMany(patientsData);
    console.log(`[Seed] Successfully seeded ${createdPatients.length} patients!`);

    console.log('[Seed] All database seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Failed to seed data:', error);
    process.exit(1);
  }
}

seedData();
