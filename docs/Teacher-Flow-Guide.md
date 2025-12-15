# Teacher Flow Guide - Formative Assessment App

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [AI Insights](#ai-insights)
4. [Learning Groups](#learning-groups)
5. [Assessments Management](#assessments-management)
6. [Students Management](#students-management)
7. [Results](#results)
8. [Reports](#reports)
9. [Classroom Observations](#classroom-observations)

---

## Getting Started

### Logging In

1. Open the application in your browser
2. On the login page, enter your email address (e.g., `sarah.ahmed@edu.example.com`)
3. Click **"Sign in"**
4. You will be automatically redirected to your Teacher Dashboard

### Navigation

Once logged in, you'll see a sidebar on the left with the following menu items:
- **Dashboard** - Your main overview page
- **AI Insights** - AI-powered student analysis (marked with AI badge)
- **Learning Groups** - Performance-based student grouping (marked with AI badge)
- **Assessments** - Create and manage assessments
- **Students** - Manage your student roster
- **Results** - View completed assessment results
- **Reports** - Generate and export reports
- **My Observations** - View classroom observation feedback

Your profile information appears at the bottom of the sidebar with your name, role badge, and logout option.

---

## Dashboard Overview

**Location:** `/dashboard/teacher`

The Dashboard is your command center, providing a comprehensive overview of your class performance.

### What You'll See

#### 1. Welcome Section
- Personalized greeting with your name
- Quick overview of your class

#### 2. Quick Stats Cards
Four key metrics displayed prominently:
- **Total Students** - Number of students in your class
- **Total Assessments** - Assessments you've created
- **Average Score** - Class-wide average performance
- **Completion Rate** - Percentage of assigned assessments completed

#### 3. Performance Visualizations
- **Performance Trends** - Line chart showing class performance over time
- **Subject Comparison** - Bar chart comparing Mathematics, English, and Urdu
- **Weekly Performance** - Multi-line chart tracking subjects week by week
- **Score Distribution** - Visual breakdown of how scores are distributed
- **Subject x Grade Heatmap** - Matrix showing which subjects need attention per grade

#### 4. At-Risk Student Alerts
- Early warning system highlighting students who may be struggling
- Shows student name, concern area, and risk level
- Quick action buttons to view details or create intervention

#### 5. Student Rankings
- Top performers listed with their scores
- Full rankings table for detailed comparison

#### 6. Week-over-Week Metrics
- Average score trends with visual sparklines
- Pass rate changes
- Completed assessment counts
- At-risk student tracking

#### 7. Performance Tier Distribution
- Donut chart showing:
  - **Proficient** (80%+)
  - **Developing** (60-79%)
  - **Needs Support** (below 60%)

#### 8. Class Goals
- Progress bars tracking your teaching targets
- Visual indicators of goal achievement

#### 9. Recent Results Feed
- Latest 6 assessment results
- Quick view of student performance

#### 10. Quick Action Buttons
- **Create Assessment** - Start building a new assessment
- **Assign Quickly** - Fast-track assignment to students
- **View Students** - Go to student management
- **All Results** - View complete results page

#### 11. Task Reminders
- Pending tasks and follow-ups
- Priority-based task list

---

## AI Insights

**Location:** `/dashboard/teacher/ai-insights`

This page provides AI-powered analysis to help you make data-driven decisions about your teaching.

### Three Tabs Available

#### Tab 1: Student Grouping (TaRL)
Teaching at the Right Level (TaRL) methodology groups students by competency:

| Group | Description |
|-------|-------------|
| **Beginner** | Students who need foundational support |
| **Developing** | Students building core skills |
| **Proficient** | Students meeting grade-level expectations |
| **Advanced** | Students ready for enrichment |

Each group shows:
- Recommended focus areas
- Suggested teaching activities
- Student list with performance data

#### Tab 2: At-Risk Students
Early warning system identifying struggling students:
- **High Risk** - Immediate attention needed
- **Medium Risk** - Close monitoring required
- **Low Risk** - Keep observing

For each at-risk student:
- Primary concern identification
- Performance trend
- Recommended immediate actions

#### Tab 3: Interventions
Personalized action plans for students:
- Priority-based interventions
- Target skill areas
- Estimated duration
- Specific activity suggestions

---

## Learning Groups

**Location:** `/dashboard/teacher/grouping`

Organize your class into performance-based groups for differentiated instruction.

### Three Performance Tiers

#### 1. Proficient (Green) - 80%+ Average
- **Focus:** Enrichment activities
- **Approach:** Advanced challenges, peer tutoring opportunities
- Shows students exceeding grade-level expectations

#### 2. Developing (Yellow) - 60-79% Average
- **Focus:** Continue building skills
- **Approach:** Targeted practice, additional support
- Shows students progressing toward proficiency

#### 3. Needs Support (Red) - Below 60% Average
- **Focus:** Intervention required
- **Approach:** Foundational skill building, one-on-one support
- Shows students requiring immediate attention

### For Each Student in a Group
- Avatar and name
- Number of assessments taken
- Average score percentage
- Performance trend indicator (Improving/Stable/Declining)

### Actions
- **Export PDF** - Download grouping report for records or sharing

---

## Assessments Management

**Location:** `/dashboard/teacher/assessments`

Create, view, and manage all your assessments from this central hub.

### Assessment List View

#### Search & Filter Options
- **Search Bar** - Find assessments by title or subject
- **Subject Filter** - Mathematics, English, Urdu
- **Grade Filter** - Grades 1-5

#### Assessment Cards Display
Each assessment card shows:
- Subject badge (color-coded)
- Assessment title
- Grade level
- Number of questions
- Duration in minutes
- Creation date
- **Assign** button - Quickly assign to students
- **Delete** button - Remove custom assessments

### Creating a New Assessment

**Location:** `/dashboard/teacher/assessments/create`

#### Step 1: Assessment Details
Fill in the basic information:
- **Title** - Name your assessment
- **Subject** - Select Mathematics, English, or Urdu
- **Grade** - Select grade level (1-5)
- **Duration** - Set time limit in minutes

#### Step 2: Add Questions
Click **"Add Question"** to open the Question Builder.

**Question Types Available:**

| Type | Description | Setup |
|------|-------------|-------|
| **Multiple Choice** | Students select one correct answer | Add 2-4 options, mark the correct one |
| **True/False** | Simple binary choice | Select whether statement is true or false |
| **Short Answer** | Students type their response | Enter the expected answer (case-insensitive) |

**For Each Question:**
- Enter the question text
- Configure type-specific options
- Add an optional hint for students
- Set point value

#### Step 3: Preview
Before publishing, preview your assessment:
- See exactly how students will view it
- Verify all questions and answers
- Check point values and hints

#### Step 4: Save
- Click **Save Assessment** to create
- Assessment appears in your list and is ready to assign

### Viewing Assessment Details

**Location:** `/dashboard/teacher/assessments/[id]`

Click any assessment to see:
- Complete assessment information
- All questions with correct answers
- Point values per question
- **Assign** button to assign to students

### Assigning an Assessment

**Location:** `/dashboard/teacher/assessments/[id]/assign`

#### Assignment Process:
1. Click **Assign** on any assessment
2. View eligible students (matching grade level)
3. Select students using checkboxes
4. See selection count update
5. Click **Assign** to confirm
6. Students will see the assessment in their dashboard

---

## Students Management

**Location:** `/dashboard/teacher/students`

Manage your complete student roster from this page.

### Student List View

Each student card displays:
- **Avatar** - Auto-generated from initials
- **Name** - Student's full name
- **Grade** - Current grade level
- **Average Score** - Performance with progress bar
- **Trend** - Performance trend (Improving/Stable/Declining)
- **Subjects** - Enrolled subjects as badges
- **Edit** button - Modify student details
- **Delete** button - Remove student

### Adding a New Student

1. Click **"Add Student"** button
2. Fill in the Student Form:
   - **Name** - Enter student's full name
   - **Grade** - Select grade level (1-5)
   - **Subjects** - Check applicable subjects:
     - Mathematics
     - English
     - Urdu
3. Click **Save** to add the student

### Editing a Student

1. Click the **Edit** button on any student card
2. Modify the information in the form
3. Click **Save** to update

### Deleting a Student

1. Click the **Delete** button on the student card
2. Confirm the deletion
3. Student and their data will be removed

---

## Results

**Location:** `/dashboard/teacher/results`

View all completed assessment results in one place.

### Results List

Each result entry shows:
- **Student Avatar & Name**
- **Assessment Subject & Grade**
- **Score Percentage** (large, prominent display)
- **Points** - Earned points / Total points
- **Completion Date & Time**
- **Status Badge** - Completed/Pending
- **Progress Bar** - Visual score representation

### Color Coding System

| Score Range | Color | Meaning |
|-------------|-------|---------|
| 80%+ | Green | Excellent performance |
| 60-79% | Yellow | Good, room for improvement |
| Below 60% | Red | Needs improvement |

### What You Can Do
- Review individual student performance
- Identify patterns across assessments
- Track improvement over time
- Click on results for detailed breakdowns

---

## Reports

**Location:** `/dashboard/teacher/reports`

Generate comprehensive reports for various purposes.

### Report Types Available

#### 1. Student Progress Report
**Purpose:** Track individual student performance over time

**Contents:**
- Complete performance history
- Subject-wise breakdowns
- Trend analysis
- Comparison to class average

**How to Generate:**
1. Select a student from the dropdown
2. Choose date range (optional)
3. Click Generate
4. Export to Excel if needed

#### 2. Class Summary Report
**Purpose:** Overview of entire class performance

**Contents:**
- Overall class statistics
- Performance distribution
- At-risk students list
- Subject-wise analysis
- Assessment completion rates

**Export Options:**
- Excel download
- Print-friendly format

#### 3. Student Report Card
**Purpose:** Parent-friendly performance summary

**Contents:**
- Student information
- Grade-based performance
- Subject summaries
- Teacher comments section
- Attendance data (if available)

**Export Options:**
- PDF download (for printing/sharing)

#### 4. Assessment Item Analysis
**Purpose:** Analyze specific assessment performance

**Contents:**
- Question-by-question breakdown
- Difficulty analysis
- Discrimination index
- Success rates per question
- Common wrong answers

**How to Generate:**
1. Select an assessment
2. View detailed analysis
3. Export to Excel for record keeping

### Export Options Summary

| Report Type | Excel | PDF | Print |
|-------------|-------|-----|-------|
| Student Progress | Yes | No | Yes |
| Class Summary | Yes | No | Yes |
| Report Card | No | Yes | Yes |
| Item Analysis | Yes | No | Yes |

---

## Classroom Observations

**Location:** `/dashboard/teacher/observations`

View feedback from classroom observations conducted by observers or administrators.

### Summary Statistics

At the top of the page:
- **Total Observations** - Number of observations conducted
- **Average Score** - Your average observation score
- **Latest Score** - Most recent observation score

### Observation Details

Each observation record shows:
- **Observer Name** - Who conducted the observation
- **Date** - When the observation occurred
- **Grade & Subject** - Class being observed
- **Observation Type** - Formal/Informal
- **Overall Score** - Color-coded performance score

### Performance Indicators
Detailed scoring across categories:
- Lesson Planning
- Teaching Methods
- Student Engagement
- Classroom Management
- Assessment Techniques

### Feedback Sections
- **Strengths** - What went well
- **Areas for Improvement** - Growth opportunities
- **Recommendations** - Specific suggestions

### Status Types
- **Completed** - Full details available
- **Draft** - Limited preview, pending completion

---

## Tips for Success

### Daily Workflow Recommendations

1. **Morning Check:**
   - Review Dashboard for at-risk alerts
   - Check task reminders
   - Review recent results

2. **Assessment Cycle:**
   - Create assessments aligned with learning objectives
   - Assign to appropriate grade-level students
   - Monitor completion in real-time

3. **Weekly Review:**
   - Use AI Insights to identify struggling students
   - Review Learning Groups for differentiated instruction
   - Generate progress reports

4. **Monthly Analysis:**
   - Export Class Summary Report
   - Review observation feedback
   - Adjust teaching strategies based on data

### Best Practices

1. **Assessment Creation:**
   - Mix question types for comprehensive evaluation
   - Set appropriate point values
   - Include helpful hints for struggling students
   - Test preview before assigning

2. **Student Management:**
   - Keep student information updated
   - Assign correct subjects to each student
   - Monitor trends regularly

3. **Using AI Features:**
   - Check At-Risk dashboard daily
   - Use TaRL grouping for differentiated instruction
   - Follow intervention recommendations

4. **Reporting:**
   - Generate Report Cards before parent meetings
   - Use Item Analysis to improve future assessments
   - Keep records with Excel exports

---

## Quick Reference

### Keyboard Navigation
- Use Tab to move between fields
- Enter to submit forms
- Escape to close modals

### Getting Help
- Contact your administrator for technical issues
- Check with UNICEF representatives for training
- Use the sidebar to navigate between sections

### Demo Accounts
For testing purposes:
- Teacher: `sarah.ahmed@edu.example.com`

---

## Glossary

| Term | Definition |
|------|------------|
| **TaRL** | Teaching at the Right Level - methodology for grouping students by competency |
| **At-Risk** | Students showing signs of academic struggle |
| **Intervention** | Targeted support for struggling students |
| **Proficient** | Students scoring 80% or above |
| **Developing** | Students scoring between 60-79% |
| **Assessment** | A test or quiz assigned to students |
| **Item Analysis** | Detailed breakdown of assessment questions |

---
