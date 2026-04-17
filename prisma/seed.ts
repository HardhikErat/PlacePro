import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  await prisma.placementSkill.deleteMany()
  await prisma.placementResult.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.application.deleteMany()
  await prisma.internship.deleteMany()
  await prisma.placement.deleteMany()
  await prisma.recruiter.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.student.deleteMany()
  await prisma.company.deleteMany()
  await prisma.department.deleteMany()

  const sp = await bcrypt.hash('student123', 12)
  const rp = await bcrypt.hash('recruiter123', 12)

  await prisma.department.createMany({ data: [
    { dept_id: 1,  dept_name: 'Computer Science' },
    { dept_id: 2,  dept_name: 'Information Technology' },
    { dept_id: 3,  dept_name: 'Electronics' },
    { dept_id: 4,  dept_name: 'Mechanical' },
    { dept_id: 5,  dept_name: 'Civil' },
    { dept_id: 6,  dept_name: 'Electrical' },
    { dept_id: 7,  dept_name: 'Artificial Intelligence' },
    { dept_id: 8,  dept_name: 'Data Science' },
    { dept_id: 9,  dept_name: 'Chemical' },
    { dept_id: 10, dept_name: 'Aerospace' },
  ]})

  await prisma.student.createMany({ data: [
    { student_id: 101, name: 'Aarav Shah',   cgpa: 8.7, dept_id: 1,  password: sp },
    { student_id: 102, name: 'Riya Mehta',   cgpa: 9.1, dept_id: 2,  password: sp },
    { student_id: 103, name: 'Kabir Patel',  cgpa: 7.8, dept_id: 3,  password: sp },
    { student_id: 104, name: 'Diya Joshi',   cgpa: 8.5, dept_id: 4,  password: sp },
    { student_id: 105, name: 'Arjun Nair',   cgpa: 7.9, dept_id: 5,  password: sp },
    { student_id: 106, name: 'Sneha Iyer',   cgpa: 9.0, dept_id: 6,  password: sp },
    { student_id: 107, name: 'Rahul Gupta',  cgpa: 8.1, dept_id: 7,  password: sp },
    { student_id: 108, name: 'Neha Verma',   cgpa: 8.6, dept_id: 8,  password: sp },
    { student_id: 109, name: 'Kunal Shah',   cgpa: 7.5, dept_id: 9,  password: sp },
    { student_id: 110, name: 'Ananya Rao',   cgpa: 9.2, dept_id: 10, password: sp },
  ]})

  await prisma.company.createMany({ data: [
    { company_id: 201, company_name: 'TCS',       location: 'Mumbai'    },
    { company_id: 202, company_name: 'Infosys',   location: 'Bangalore' },
    { company_id: 203, company_name: 'Wipro',     location: 'Pune'      },
    { company_id: 204, company_name: 'Accenture', location: 'Hyderabad' },
    { company_id: 205, company_name: 'Capgemini', location: 'Mumbai'    },
    { company_id: 206, company_name: 'Google',    location: 'Hyderabad' },
    { company_id: 207, company_name: 'Microsoft', location: 'Bangalore' },
    { company_id: 208, company_name: 'Amazon',    location: 'Hyderabad' },
    { company_id: 209, company_name: 'IBM',       location: 'Pune'      },
    { company_id: 210, company_name: 'Oracle',    location: 'Bangalore' },
  ]})

  await prisma.recruiter.createMany({ data: [
    { recruiter_id: 301, recruiter_name: 'Raj Malhotra', company_id: 201, password: rp },
    { recruiter_id: 302, recruiter_name: 'Neha Sharma',  company_id: 202, password: rp },
    { recruiter_id: 303, recruiter_name: 'Amit Singh',   company_id: 203, password: rp },
    { recruiter_id: 304, recruiter_name: 'Priya Kapoor', company_id: 204, password: rp },
    { recruiter_id: 305, recruiter_name: 'Rohit Verma',  company_id: 205, password: rp },
    { recruiter_id: 306, recruiter_name: 'Sanjay Kumar', company_id: 206, password: rp },
    { recruiter_id: 307, recruiter_name: 'Meera Nair',   company_id: 207, password: rp },
    { recruiter_id: 308, recruiter_name: 'Anil Joshi',   company_id: 208, password: rp },
    { recruiter_id: 309, recruiter_name: 'Ritika Shah',  company_id: 209, password: rp },
    { recruiter_id: 310, recruiter_name: 'Vikas Gupta',  company_id: 210, password: rp },
  ]})

  await prisma.internship.createMany({ data: [
    { internship_id: 401, company_id: 201, duration_months: 6, stipend: 20000 },
    { internship_id: 402, company_id: 202, duration_months: 3, stipend: 15000 },
    { internship_id: 403, company_id: 203, duration_months: 4, stipend: 18000 },
    { internship_id: 404, company_id: 204, duration_months: 6, stipend: 25000 },
    { internship_id: 405, company_id: 205, duration_months: 3, stipend: 12000 },
    { internship_id: 406, company_id: 206, duration_months: 6, stipend: 35000 },
    { internship_id: 407, company_id: 207, duration_months: 6, stipend: 30000 },
    { internship_id: 408, company_id: 208, duration_months: 4, stipend: 25000 },
    { internship_id: 409, company_id: 209, duration_months: 5, stipend: 20000 },
    { internship_id: 410, company_id: 210, duration_months: 3, stipend: 22000 },
  ]})

  await prisma.application.createMany({ data: [
    { application_id: 501, student_id: 101, company_id: 201 },
    { application_id: 502, student_id: 102, company_id: 202 },
    { application_id: 503, student_id: 103, company_id: 203 },
    { application_id: 504, student_id: 104, company_id: 204 },
    { application_id: 505, student_id: 105, company_id: 205 },
    { application_id: 506, student_id: 106, company_id: 206 },
    { application_id: 507, student_id: 107, company_id: 207 },
    { application_id: 508, student_id: 108, company_id: 208 },
    { application_id: 509, student_id: 109, company_id: 209 },
    { application_id: 510, student_id: 110, company_id: 210 },
  ]})

  await prisma.interview.createMany({ data: [
    { interview_id: 601, application_id: 501, recruiter_id: 301, round_no: 1, result: 'Pass' },
    { interview_id: 602, application_id: 502, recruiter_id: 302, round_no: 1, result: 'Pass' },
    { interview_id: 603, application_id: 503, recruiter_id: 303, round_no: 1, result: 'Fail' },
    { interview_id: 604, application_id: 504, recruiter_id: 304, round_no: 2, result: 'Pass' },
    { interview_id: 605, application_id: 505, recruiter_id: 305, round_no: 1, result: 'Pass' },
    { interview_id: 606, application_id: 506, recruiter_id: 306, round_no: 1, result: 'Pass' },
    { interview_id: 607, application_id: 507, recruiter_id: 307, round_no: 2, result: 'Pass' },
    { interview_id: 608, application_id: 508, recruiter_id: 308, round_no: 1, result: 'Fail' },
    { interview_id: 609, application_id: 509, recruiter_id: 309, round_no: 1, result: 'Pass' },
    { interview_id: 610, application_id: 510, recruiter_id: 310, round_no: 2, result: 'Pass' },
  ]})

  await prisma.placement.createMany({ data: [
    { placement_id: 701, company_id: 201, role: 'Software Engineer',  ctc:  800000 },
    { placement_id: 702, company_id: 202, role: 'System Analyst',     ctc:  700000 },
    { placement_id: 703, company_id: 203, role: 'Developer',          ctc:  650000 },
    { placement_id: 704, company_id: 204, role: 'Consultant',         ctc:  900000 },
    { placement_id: 705, company_id: 205, role: 'Programmer',         ctc:  600000 },
    { placement_id: 706, company_id: 206, role: 'Cloud Engineer',     ctc: 1500000 },
    { placement_id: 707, company_id: 207, role: 'Software Developer', ctc: 1400000 },
    { placement_id: 708, company_id: 208, role: 'Data Engineer',      ctc: 1300000 },
    { placement_id: 709, company_id: 209, role: 'Backend Developer',  ctc: 1000000 },
    { placement_id: 710, company_id: 210, role: 'Database Engineer',  ctc:  950000 },
  ]})

  await prisma.placementResult.createMany({ data: [
    { result_id: 801, student_id: 101, placement_id: 701, status: 'Selected' },
    { result_id: 802, student_id: 102, placement_id: 702, status: 'Selected' },
    { result_id: 803, student_id: 103, placement_id: 703, status: 'Rejected' },
    { result_id: 804, student_id: 104, placement_id: 704, status: 'Selected' },
    { result_id: 805, student_id: 105, placement_id: 705, status: 'Selected' },
    { result_id: 806, student_id: 106, placement_id: 706, status: 'Selected' },
    { result_id: 807, student_id: 107, placement_id: 707, status: 'Rejected' },
    { result_id: 808, student_id: 108, placement_id: 708, status: 'Selected' },
    { result_id: 809, student_id: 109, placement_id: 709, status: 'Selected' },
    { result_id: 810, student_id: 110, placement_id: 710, status: 'Selected' },
  ]})

  await prisma.skill.createMany({ data: [
    { skill_id: 901, skill_name: 'Java' },
    { skill_id: 902, skill_name: 'Python' },
    { skill_id: 903, skill_name: 'SQL' },
    { skill_id: 904, skill_name: 'Data Structures' },
    { skill_id: 905, skill_name: 'Cloud Computing' },
    { skill_id: 906, skill_name: 'Machine Learning' },
    { skill_id: 907, skill_name: 'Web Development' },
    { skill_id: 908, skill_name: 'Cyber Security' },
    { skill_id: 909, skill_name: 'Networking' },
    { skill_id: 910, skill_name: 'Operating Systems' },
  ]})

  await prisma.placementSkill.createMany({ data: [
    { placement_id: 701, skill_id: 901 },
    { placement_id: 702, skill_id: 902 },
    { placement_id: 703, skill_id: 903 },
    { placement_id: 704, skill_id: 904 },
    { placement_id: 705, skill_id: 907 },
    { placement_id: 706, skill_id: 905 },
    { placement_id: 707, skill_id: 901 },
    { placement_id: 708, skill_id: 906 },
    { placement_id: 709, skill_id: 903 },
    { placement_id: 710, skill_id: 910 },
  ]})

  console.log('✅ Seeded successfully')
  console.log('')
  console.log('Login credentials:')
  console.log('  Students   : student_id (101-110) + password: student123')
  console.log('  Recruiters : recruiter_id (301-310) + password: recruiter123')
  console.log('  Admin      : ADMIN_SECRET = admin2026')
}

main().catch(console.error).finally(() => prisma.$disconnect())
