<<<<<<< HEAD
# PlacePro — Internship & Placement Portal

> K.J. Somaiya School of Engineering · Roll No: 16010124083 · DBMS Lab · Semester IV

---

## Database Schema (exact SQL match)

```sql
Department  (dept_id PK, dept_name)
Student     (student_id PK, name, cgpa, dept_id FK→Department SET NULL)
Company     (company_id PK, company_name, location)
Recruiter   (recruiter_id PK, recruiter_name, company_id FK→Company CASCADE)
Internship  (internship_id PK, company_id FK→Company CASCADE, duration_months, stipend)
Application (application_id PK, student_id FK→Student CASCADE, company_id FK→Company CASCADE)
Interview   (interview_id PK, application_id FK→Application CASCADE, recruiter_id FK→Recruiter CASCADE, round_no, result)
Placement   (placement_id PK, company_id FK→Company CASCADE, role, ctc)
Placement_Result (result_id PK, student_id FK→Student CASCADE, placement_id FK→Placement CASCADE, status)
Skill       (skill_id PK, skill_name)
Placement_Skill  (placement_id PK+FK, skill_id PK+FK)  ← M:N junction
```

No extra columns. No email. No password. No status on Application. No timestamps. Exact match.

---

## Quick Start

### 1. Install
```bash
cd placement-portal
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env — set your PostgreSQL credentials
```
`.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/placement_portal"
JWT_SECRET="any-long-random-string"
ADMIN_SECRET="admin2026"
```

### 3. Push schema & seed
```bash
npm run db:push    # creates all 11 tables
npm run db:seed    # inserts exact data from SQL script
```

### 4. Run
```bash
npm run dev
# → http://localhost:3000
```

---

## Login (no passwords — login by ID)

| Role      | How to login              | Example IDs      |
|-----------|---------------------------|------------------|
| Student   | Enter your `student_id`   | 101, 102 … 110   |
| Recruiter | Enter your `recruiter_id` | 301, 302 … 310   |
| Admin     | Enter `ADMIN_SECRET`      | `admin2026`      |

> **After registering** a new student/recruiter, note the assigned ID — that's your login credential.

---

## Seeded Data (exact SQL INSERT values)

### Students
| student_id | name         | cgpa | dept_id |
|-----------|--------------|------|---------|
| 101 | Aarav Shah   | 8.7  | 1 (CS)  |
| 102 | Riya Mehta   | 9.1  | 2 (IT)  |
| 103 | Kabir Patel  | 7.8  | 3 (Elec)|
| ... | ...          | ...  | ...     |
| 110 | Ananya Rao   | 9.2  | 10 (Aero)|

### Companies (201–210)
TCS, Infosys, Wipro, Accenture, Capgemini, Google, Microsoft, Amazon, IBM, Oracle

### Recruiters (301–310) · Internships (401–410) · Applications (501–510)
### Interviews (601–610) · Placements (701–710) · Results (801–810)
### Skills (901–910): Java, Python, SQL, Data Structures, Cloud Computing, ML, Web Dev, Cyber Security, Networking, OS

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login by student_id / recruiter_id / admin secret |
| POST | `/api/auth/signup` | Register student or recruiter |
| POST | `/api/auth/logout` | Clear session |
| GET/POST | `/api/students` | List or insert students |
| GET/POST | `/api/companies` | List or insert companies |
| GET/POST | `/api/departments` | List or insert departments |
| GET/POST | `/api/internships` | List or insert internships |
| GET/POST | `/api/placements` | List or insert placements |
| GET/POST | `/api/applications` | List or insert applications |
| GET/POST | `/api/interviews` | List or insert interviews |
| GET/POST | `/api/skills` | List or insert skills |
| GET/POST | `/api/placement-results` | List or insert placement results |
| GET | `/api/admin/analytics` | Aggregated stats |

All POST requests require the **exact column names** from the SQL schema as JSON keys.

---

## Prisma Studio (visual DB browser)
```bash
npm run db:studio
# Opens at http://localhost:5555
```

---

*Built for DBMS Lab — Department of Electronics and Computer Engineering, K.J. Somaiya School of Engineering, Mumbai-77*
=======
# PlacePro
>>>>>>> fd53ff4e3b98e694080f06de1d1784899b09beea
