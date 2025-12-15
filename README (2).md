# AI-Enabled Formative Assessment Application

A modern, futuristic web application prototype for formative assessment in primary grades (1-5).

## Features

- 🎨 **Futuristic UI/UX** - Modern gradient designs with glass morphism effects
- 👨‍🏫 **Teacher Dashboard** - Manage assessments, students, and view results
- 👨‍💼 **Admin Dashboard** - System-wide analytics and management
- 📊 **Real-time Analytics** - View assessment results and performance metrics
- 📝 **Assessment Management** - Create, assign, and track assessments
- 👥 **Student Management** - Track student progress and performance
- 📈 **Results & Analytics** - Detailed performance insights
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern styling with gradients
- **JSON Data** - Preloaded dummy data (no database required)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd assessment-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Accounts

### Teacher Account
- Email: `sarah.ahmed@edu.example.com`
- Access: Teacher dashboard with student management and observations

### Admin Account
- Email: `ali.khan@edu.example.com`
- Access: Admin dashboard with system-wide analytics

### Observer Account
- Email: `amina.baloch@edu.example.com`
- Access: Observer dashboard with classroom observation management

### Student Account
- Email: `ahmad.ali@student.example.com`
- Access: Student assessment interface

## Project Structure

```
assessment-app/
├── app/
│   ├── dashboard/
│   │   ├── teacher/        # Teacher dashboard pages
│   │   └── admin/          # Admin dashboard pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Login page
│   └── globals.css         # Global styles
├── components/
│   ├── layout/             # Layout components (Sidebar, Header)
│   └── ui/                 # UI components (Button, Card, StatCard)
├── data/
│   └── dummyData.json      # Preloaded dummy data
├── lib/
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript type definitions
```

## Key Pages

### Teacher Dashboard
- `/dashboard/teacher` - Main dashboard with stats
- `/dashboard/teacher/assessments` - View all assessments
- `/dashboard/teacher/students` - Manage students
- `/dashboard/teacher/results` - View assessment results

### Admin Dashboard
- `/dashboard/admin` - System overview
- `/dashboard/admin/assessments` - All assessments
- `/dashboard/admin/students` - All students
- `/dashboard/admin/analytics` - System analytics
- `/dashboard/admin/observations` - Classroom observations

## Features Implemented

✅ Modern login page with gradient animations
✅ Role-based authentication (Teacher/Admin)
✅ Responsive sidebar navigation
✅ Dashboard with statistics cards
✅ Assessment listing and detail views
✅ Student management interface
✅ Results and analytics views
✅ Classroom observation reports
✅ Gradient-based UI components
✅ Glass morphism effects
✅ Smooth animations and transitions

## Design Highlights

- **Gradient Backgrounds** - Animated gradient backgrounds with floating orbs
- **Glass Morphism** - Frosted glass effect on cards and components
- **Gradient Text** - Eye-catching gradient text effects
- **Glow Effects** - Subtle glow effects on interactive elements
- **Smooth Animations** - Hover effects and transitions throughout
- **Color Coding** - Subject-based color schemes (Math=Blue, English=Purple, Urdu=Green)

## Future Enhancements

- [ ] Voice recognition for assessments
- [ ] Multilingual support
- [ ] Offline-first functionality
- [ ] Real-time AI-based classroom observation
- [ ] Advanced analytics and reporting
- [ ] Integration with school management systems

## License

This is a prototype application for demonstration purposes.
