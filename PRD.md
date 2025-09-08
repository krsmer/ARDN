# Product Requirements Document (PRD)
## Öğrenci Yurt Puan Sistemli Takip Uygulaması

### Document Information
- **Version**: 1.0
- **Date**: 2025-09-07
- **Status**: Draft
- **Author**: Development Team

---

## 1. Executive Summary

### 1.1 Product Overview
Web-based application for tracking student participation in dormitory programs using a gamified point system called "ARDN". The application is designed for teachers and administrators to manage student activities and track engagement through a motivational point-based approach.

### 1.2 Target Users
- **Primary**: Teachers/Educators
- **Secondary**: School Administrators
- **Note**: Students do not directly use the application

### 1.3 Key Value Propositions
- Streamlined student participation tracking
- Gamified motivation through ARDN point system
- Comprehensive reporting and analytics
- Multi-program/semester management
- Mobile-optimized interface for on-the-go management

---

## 2. Problem Statement

### 2.1 Current Challenges
- Manual tracking of student participation in dormitory programs
- Lack of motivation systems for student engagement
- Difficulty in generating participation reports
- No centralized system for multi-program management
- Time-consuming attendance marking processes

### 2.2 Success Metrics
- 90%+ teacher adoption rate
- 50%+ reduction in attendance tracking time
- 30%+ increase in student participation rates
- 95%+ system uptime
- Sub-2 second page load times

---

## 3. User Personas

### 3.1 Primary Persona: Hoca/Öğretmen (Teacher)
- **Role**: Program instructor/supervisor
- **Responsibilities**: Activity management, attendance tracking, basic reporting
- **Pain Points**: Manual attendance, limited reporting options
- **Goals**: Efficient tracking, motivating students, quick reporting

### 3.2 Secondary Persona: Yönetici (Administrator)
- **Role**: System administrator
- **Responsibilities**: User management, program oversight, comprehensive reporting
- **Pain Points**: Complex data analysis, multi-program coordination
- **Goals**: System oversight, comprehensive analytics, user management

---

## 4. Core Features & Requirements

### 4.1 Authentication & Authorization
**Priority**: P0 (Critical)

#### Features:
- JWT-based secure login system
- Email/password authentication
- "Remember Me" functionality
- Password reset via email
- Role-based access control

#### Acceptance Criteria:
- ✅ Secure login with email/password
- ✅ JWT tokens expire after 24 hours
- ✅ Password reset functionality
- ✅ Role-based dashboard access
- ✅ Session management

### 4.2 Program Management
**Priority**: P0 (Critical)

#### Features:
- Create/edit/delete programs
- Set start/end dates
- Program status management (active/inactive)
- Program-based access control

#### Acceptance Criteria:
- ✅ CRUD operations for programs
- ✅ Date validation (end date > start date)
- ✅ Active/inactive status toggle
- ✅ Teacher assignment to programs

### 4.3 Student Management
**Priority**: P0 (Critical)

#### Features:
- Add/edit/delete students
- Bulk student import (Excel/CSV)
- Student photo upload
- Class/program assignment
- Student search/filtering

#### Acceptance Criteria:
- ✅ Individual student CRUD operations
- ✅ Bulk import with validation
- ✅ Photo upload with size/format limits
- ✅ Search by name/student number
- ✅ Filter by class/program

### 4.4 Activity Management
**Priority**: P0 (Critical)

#### Features:
- Create activities with title, description, date/time
- Set ARDN point values (1-100)
- Set maximum participants
- Recurring activity options
- Attendance marking (individual/bulk)
- Late attendance with point deduction
- QR code for quick attendance

#### Acceptance Criteria:
- ✅ Activity creation with all required fields
- ✅ Point value validation (1-100)
- ✅ Date/time scheduling
- ✅ Bulk attendance marking
- ✅ Late attendance handling
- ✅ QR code generation

### 4.5 Point System (ARDN)
**Priority**: P0 (Critical)

#### Features:
- Automatic point calculation
- Bonus/penalty point adjustments
- Point history tracking
- Negative point prevention (minimum 0)
- Real-time point updates

#### Acceptance Criteria:
- ✅ Auto-calculation on attendance
- ✅ Manual point adjustments
- ✅ Point history maintained
- ✅ Non-negative point enforcement
- ✅ Real-time leaderboard updates

### 4.6 Reporting & Analytics
**Priority**: P1 (High)

#### Features:
- Real-time leaderboard (ARDN-based ranking)
- Student participation reports
- Activity analytics
- Weekly/monthly statistics
- Excel/PDF export
- Date range filtering

#### Acceptance Criteria:
- ✅ Live leaderboard with filters
- ✅ Detailed participation reports
- ✅ Export in multiple formats
- ✅ Custom date range selection
- ✅ Class-based filtering

### 4.7 Mobile Optimization
**Priority**: P1 (High)

#### Features:
- Responsive design (mobile-first)
- Touch-friendly interface
- QR code scanner integration
- Offline capability (PWA)
- Fast loading times

#### Acceptance Criteria:
- ✅ Mobile-responsive design
- ✅ Touch-optimized controls
- ✅ QR scanner functionality
- ✅ PWA implementation
- ✅ <2s page load times

---

## 5. Technical Requirements

### 5.1 Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 18+, TailwindCSS
- **Backend**: Next.js API Routes, Node.js 18+
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel/Railway
- **CI/CD**: GitHub Actions

### 5.2 Performance Requirements
- Page load time: <2 seconds
- API response time: <500ms
- Database query time: <200ms
- Concurrent users: 100+
- Uptime: 99.5%

### 5.3 Security Requirements
- HTTPS mandatory
- JWT token expiry (24 hours)
- Input validation (Zod schemas)
- SQL injection protection (Prisma)
- Rate limiting on API endpoints
- File upload restrictions
- CORS policies

### 5.4 Scalability Requirements
- Support for 1000+ students per program
- 10+ concurrent programs
- 50+ concurrent users
- Database optimization with indexing
- Image optimization and caching

---

## 6. Database Schema

### 6.1 Core Tables
- **users**: User authentication and profile data
- **programs**: Academic periods/semesters
- **teacher_programs**: Teacher-program assignments
- **students**: Student information and program assignment
- **activities**: Activity definitions and scheduling
- **participations**: Attendance records
- **point_adjustments**: Manual point modifications

### 6.2 Key Relationships
- One-to-many: Program → Students
- Many-to-many: Teachers ↔ Programs
- One-to-many: Activity → Participations
- One-to-many: Student → Participations

---

## 7. User Experience & Interface

### 7.1 Design Principles
- Clean, intuitive interface with dark theme
- Mobile-first responsive design
- Minimal clicks for common tasks
- Clear visual hierarchy with card-based layouts
- Accessibility compliance (WCAG 2.1)

### 7.2 Design System (Based on Stitch Designs)
#### Color Palette:
- **Primary**: `#38e07b` (Bright Green)
- **Background**: `#122118` (Dark Green)
- **Surface**: `#264532` (Medium Green)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#96c5a9` (Light Green)
- **Border**: `#366348` (Green Border)

#### Typography:
- **Font Family**: Spline Sans, Noto Sans (fallback)
- **Weights**: 400 (normal), 500 (medium), 700 (bold), 900 (black)

#### UI Components:
- **Cards**: Rounded corners (rounded-xl), subtle shadows
- **Buttons**: Rounded-full for primary actions, consistent padding
- **Forms**: Icon prefixes, focus states with primary color
- **Navigation**: Bottom tab bar with icons and labels
- **FAB**: Floating action buttons for primary actions

### 7.3 Key User Flows
1. **Login Flow**: Email → Password → Dashboard
2. **Attendance Flow**: Select Activity → Mark Students → Confirm
3. **Report Flow**: Select Filters → Generate → Export
4. **Student Management**: Add → Photo Upload → Assign Program

### 7.4 Navigation Structure
- Dashboard (overview)
- Programs (management)
- Students (CRUD + reports)
- Activities (CRUD + attendance)
- Reports (analytics + export)
- Settings (profile + preferences)

---

## 8. MVP Definition

### 8.1 MVP Features (4-6 weeks)
1. ✅ User login system
2. ✅ Basic program creation
3. ✅ Student addition/listing
4. ✅ Activity creation and participation tracking
5. ✅ Simple leaderboard
6. ✅ Excel export functionality

### 8.2 MVP Success Criteria
- Teachers can log in and manage one program
- Students can be added and assigned to activities
- Basic attendance tracking works
- Simple leaderboard displays correctly
- Basic reports can be exported

### 8.3 Post-MVP Features
- Advanced reporting dashboard
- QR code integration
- Bulk operations
- Advanced filtering
- Email notifications

---

## 9. Risk Assessment

### 9.1 Technical Risks
- **High**: Database performance with large datasets
- **Medium**: Mobile performance optimization
- **Low**: Third-party service dependencies

### 9.2 Business Risks
- **Medium**: User adoption challenges
- **Low**: Feature scope creep
- **Low**: Competition from existing solutions

### 9.3 Mitigation Strategies
- Regular performance testing
- User feedback integration
- Iterative development approach
- Comprehensive documentation

---

## 10. Success Metrics & KPIs

### 10.1 User Engagement
- Daily active users
- Session duration
- Feature adoption rates
- User retention rate

### 10.2 System Performance
- Page load times
- API response times
- Error rates
- System uptime

### 10.3 Business Impact
- Time saved on attendance tracking
- Student participation increase
- Teacher satisfaction scores
- Report generation frequency

---

## 11. Timeline & Milestones

### 11.1 Phase 1: MVP (Weeks 1-6)
- Week 1-2: Project setup, authentication
- Week 3-4: Core CRUD operations
- Week 5-6: Basic reporting, testing

### 11.2 Phase 2: Enhanced Features (Weeks 7-10)
- Week 7-8: Advanced reporting, QR codes
- Week 9-10: Mobile optimization, PWA

### 11.3 Phase 3: Production Ready (Weeks 11-14)
- Week 11-12: Performance optimization
- Week 13-14: Security audit, deployment

---

## 12. Appendix

### 12.1 Glossary
- **ARDN**: Point system currency name
- **Program**: Academic semester/period
- **Activity**: Trackable event/class
- **Participation**: Attendance record

### 12.2 References
- Original project specification
- UI/UX design files
- Technical architecture documents

---

*This document will be updated as requirements evolve and new insights are gained.*