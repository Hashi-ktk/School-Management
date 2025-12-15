# Student User Guide - EduAssess Platform

Welcome to EduAssess! This guide will walk you through every page of the platform and help you make the most of your learning journey.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Student Dashboard](#student-dashboard)
3. [Assessments](#assessments)
4. [Taking an Assessment](#taking-an-assessment)
5. [Assessment Completion](#assessment-completion)
6. [Results History](#results-history)
7. [Progress Tracking](#progress-tracking)
8. [Achievements & Badges](#achievements--badges)
9. [Practice Mode](#practice-mode)
10. [AI Tutor](#ai-tutor)
11. [Navigation Flow Chart](#navigation-flow-chart)

---

## Getting Started

### Login Page

**URL:** `/` (Home Page)

When you first visit EduAssess, you'll see the landing page with a login form.

**How to Login:**
1. Enter your email address in the login field
2. Click the "Sign In" button
3. You'll be redirected to your Student Dashboard

**Demo Account Available:**
- Email: `ahmad.ali@student.example.com`

**What You'll See:**
- Platform introduction and features
- Login form
- Testimonials from other students
- Platform statistics

---

## Student Dashboard

**URL:** `/dashboard/student`

The dashboard is your home base - it gives you a complete overview of your learning progress.

### Welcome Section
- Personalized greeting with your name and grade
- Current streak (consecutive days of activity)
- Your level and XP (experience points)
- Overall average score displayed in a progress ring

### Statistics Cards
| Card | Description |
|------|-------------|
| Available | Number of assessments you can take |
| Completed | Number of assessments you've finished |
| Average | Your overall average score |
| Best | Your highest score achieved |

### AI Learning Insights
A special card with personalized recommendations from our AI system:
- Highlights your strengths
- Suggests areas for improvement
- Provides learning tips

### Performance Comparison
- See how you compare to your class average
- Subject-by-subject comparison (Math, English, Urdu)
- Visual bar charts showing your ranking

### Charts & Visualizations
- **Score History:** Line chart showing your progress over time
- **Subject Skills:** Radar chart showing your strengths across subjects
- **Weekly Performance:** Track your performance by subject each week

### Subject Deep Dive
Detailed cards for each subject showing:
- Average score
- Performance trend (improving/declining/stable)
- Best score
- Number of attempts
- Pass rate percentage

### Study Recommendations
AI-generated suggestions for subjects where you score below 70%

### Activity Calendar
A 12-week heatmap showing your daily learning activity

### Quick Actions
- Start a new assessment
- Resume an in-progress assessment
- View your results
- See all available assessments

---

## Assessments

**URL:** `/dashboard/student/assessments`

This page shows all assessments available to you.

### Statistics Dashboard
Four clickable stat cards at the top:
- **Total:** All assessments
- **Completed:** Finished assessments (green)
- **In Progress:** Started but not finished (amber)
- **New:** Not yet started (blue)

Click any stat card to filter assessments by that status.

### Filtering Options
- **By Subject:** All / Mathematics / English / Urdu
- **By Status:** Click the stat cards

### Assessment Cards
Each assessment card displays:
- Status badge (New, In Progress, or Completed)
- Subject icon
- Assessment title
- Number of questions
- Time duration
- Your score (if completed)
- Action button:
  - **Start** - For new assessments
  - **Continue** - For in-progress assessments
  - **Retake** - For completed assessments

### How to Start an Assessment
1. Browse the available assessments
2. Use filters to find what you need
3. Click the "Start" button on any assessment card
4. You'll be taken to the assessment page

---

## Taking an Assessment

**URL:** `/dashboard/student/assessment/[id]`

This is where you answer questions and complete your assessment.

### Header Information
- Assessment title
- Subject and grade level
- Timer countdown
- Progress bar showing completion percentage

### Question Display
- Question number (e.g., "Question 3 of 10")
- Question text
- Text-to-speech button (click to hear the question read aloud)
- Answer options based on question type

### Question Types
| Type | How to Answer |
|------|---------------|
| Multiple Choice | Click on one of the options |
| True/False | Select True or False |
| Short Answer | Type your answer in the text box |

### Adaptive Level Indicator
A special panel showing:
- Your current ability level (1.0 to 4.0)
- Questions answered
- Correct answers count
- Consecutive correct/incorrect streaks

The system adapts to your performance - questions may get easier or harder based on how you're doing!

### Navigation
- **Previous Button:** Go back to the previous question
- **Next Button:** Move to the next question
- **Submit Button:** Appears on the last question

### Timer
- Counts down from the assessment duration
- Changes color when time is running low:
  - **Yellow:** Warning - time is getting low
  - **Red:** Critical - almost out of time
- Assessment auto-submits when time expires

### Auto-Save Feature
- Your progress is automatically saved every 30 seconds
- If you close the browser, you can resume later
- Click "Exit" to save and leave (you can continue later)

### Submitting Your Assessment
1. Answer all questions
2. Click "Submit" on the last question
3. Confirm your submission
4. View your results on the completion page

---

## Assessment Completion

**URL:** `/dashboard/student/assessment/[id]/complete`

Congratulations! You've completed an assessment. This page shows your results.

### Score Display
- Large celebration emoji based on your score
- Score message:
  - 90%+ = "Outstanding!"
  - 80-89% = "Excellent!"
  - 70-79% = "Great Job!"
  - 60-69% = "Good Work!"
  - 50-59% = "Nice Try!"
  - Below 50% = "Keep Practicing!"
- Big progress ring with your percentage score
- Points earned out of total points
- Number of correct answers

### Confetti Celebration
If you score 70% or higher, you'll see a confetti animation!

### AI Personalized Feedback
A special feedback card with:
- **Main Message:** Overall assessment of your performance
- **Encouragement:** Motivational message
- **Strengths:** What you did well (green section)
- **Focus Areas:** What to improve (orange section)
- **Next Steps:** Numbered list of recommendations
- **Subject Tip:** Specific advice for the subject

Each section has a text-to-speech button so you can listen to the feedback.

### Navigation Options
- **View All Results:** See your complete results history
- **Back to Dashboard:** Return to your main dashboard

---

## Results History

**URL:** `/dashboard/student/results`

View all your past assessment results in one place.

### Statistics Summary
Three cards at the top:
- Total completed assessments
- Average score across all assessments
- Highest score achieved

### Results List
Each result card shows:
- Subject icon and name
- Assessment title
- Completion date
- Large percentage score (color-coded)
- Performance badge:
  - 90%+ = Excellent
  - 80-89% = Great
  - 70-79% = Good
  - 60-69% = Fair
  - Below 60% = Needs Work

### Expandable Details
Click any result to expand and see:
- Answer breakdown for each question
- Question text
- Whether you got it correct or incorrect
- Points earned per question
- Option to view personalized feedback

### Empty State
If you haven't completed any assessments yet, you'll see a friendly message encouraging you to take your first assessment.

---

## Progress Tracking

**URL:** `/dashboard/student/progress`

Track your learning journey and see how you're improving over time.

### Overview Cards
Four summary cards:
| Card | Description |
|------|-------------|
| Total Completed | Number of assessments finished |
| Overall Average | Your average score with progress ring |
| Recent Trend | Whether you're improving (+%) or declining (-%) |
| Strongest Subject | Your best performing subject |

### Performance Charts
- **Score History:** Line chart showing your scores over time
- **Subject Skills:** Radar chart comparing your performance across all subjects

### Subject Progress Cards
Detailed cards for Mathematics, English, and Urdu:
- Subject icon and name
- Trend indicator (arrow up = improving, arrow down = declining)
- Average percentage with progress bar
- Statistics:
  - Total tests taken
  - Best score
  - Trend percentage

Cards are color-coded:
- Green = Above 70% (Excellent)
- Amber = 50-70% (Good progress)
- Red = Below 50% (Needs attention)

### Learning Goals
Track your progress toward three goals:
1. Reach 70% overall average
2. Complete 10 assessments
3. Show improvement over time

Each goal shows a checkbox when completed!

---

## Achievements & Badges

**URL:** `/dashboard/student/achievements`

Collect badges and unlock achievements as you learn!

### Overall Progress
- Shows how many badges you've earned out of total available
- Circular progress ring with percentage

### Badge Categories

#### Performance Badges
| Badge | How to Earn |
|-------|-------------|
| Perfect Score | Get 100% on any assessment |
| High Achiever | Score 90%+ on 5 assessments |
| Math Master | Score 80%+ on 3 Math assessments |
| English Expert | Score 80%+ on 3 English assessments |
| Urdu Star | Score 80%+ on 3 Urdu assessments |

#### Consistency Badges
| Badge | How to Earn |
|-------|-------------|
| First Steps | Complete your first assessment |
| Getting Started | Complete 5 assessments |
| Dedicated Learner | Complete 10 assessments |
| Assessment Champion | Complete 20 assessments |
| Well Rounded | Complete assessments in all subjects |

#### Improvement Badges
| Badge | How to Earn |
|-------|-------------|
| On The Rise | Improve by 10% from your first score |
| Comeback Kid | Score 80%+ after getting below 50% |
| Steady Progress | Score 60%+ on 5 consecutive assessments |

#### Special Badges
| Badge | How to Earn |
|-------|-------------|
| Early Bird | Complete an assessment before noon |
| Quick Thinker | Finish an assessment in under 5 minutes |
| On Fire | Maintain a 3-day activity streak |

### Badge Display
- **Earned Badges:** Full color with checkmark
- **Locked Badges:** Grayscale with progress bar showing how close you are

---

## Practice Mode

**URL:** `/dashboard/student/practice`

Practice without pressure! No timer, no grades - just learning.

### Subject Selection Screen
- **AI Recommendation:** Shows which subjects you should practice (based on scores below 70%)
- Three subject cards to choose from:
  - Mathematics (6 questions available)
  - English (5 questions available)
  - Urdu (3 questions available)
- "Recommended" badge appears on weak subjects
- Practice tips to help you learn effectively

### Practice Session
Once you select a subject:

**Stats Bar:**
- Correct answers count
- Total questions attempted
- Current streak (consecutive correct answers)

**Question Card:**
- Difficulty badge (Easy, Medium, or Hard)
- Question text
- Text-to-speech button
- Answer input (varies by question type)

**After Answering:**
- Immediate feedback (green = correct, red = incorrect)
- Explanation of the correct answer
- "Next Question" button

**Streak Bonus:**
When you get 5+ correct in a row, you'll see a special celebration!

### Practice Features
- No time limit - take as long as you need
- Unlimited attempts
- Random question selection
- Instant feedback
- Learn from explanations
- End session anytime

---

## AI Tutor

**URL:** `/dashboard/student/ai-tutor`

Your personal AI learning assistant!

### Chat Interface (Left Side)
- AI tutor avatar with "Online" status
- Chat message history
- Your messages appear in purple (right side)
- AI responses appear in gray (left side)
- Text-to-speech on AI messages
- Message input field
- Quick action buttons:
  - "Help with Math"
  - "English tips"
  - "Urdu help"

### How to Use the Chat
1. Type your question in the input field
2. Click "Send" or press Enter
3. Wait for the AI's response
4. Use quick action buttons for common topics

**Example Questions:**
- "How do I add numbers?"
- "What is a noun?"
- "Help me with Urdu alphabet"
- "I need help with multiplication"

### Learning Tips Library (Right Side)
Browse educational tips organized by subject:

**Filter Options:**
- All Tips
- Mathematics
- English
- Urdu

**AI Recommendation Banner:**
Shows which subjects you should focus on based on your performance

**Each Tip Card Shows:**
- Subject icon
- Topic name
- Difficulty level badge
- Explanation
- Example (when available)
- Text-to-speech button

### Available Learning Tips

**Mathematics:**
- Addition basics
- Subtraction methods
- Multiplication tables
- Division concepts
- Understanding fractions

**English:**
- What are nouns?
- Understanding verbs
- Using adjectives
- Building sentences
- Reading strategies

**Urdu:**
- Urdu letters (حروف)
- Building vocabulary (الفاظ)
- Making sentences (جملے)

---

## Navigation Flow Chart

```
                    +------------------+
                    |   Landing Page   |
                    |    (Login)       |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Student Dashboard|<----[HOME]
                    +--------+---------+
                             |
        +--------------------+--------------------+
        |          |         |         |         |
        v          v         v         v         v
+-------+--+ +-----+----+ +-+-------+ +-+-----+ +-+------+
|Assessments| |  Results | |Progress| |Achieve| |Practice|
+-----+-----+ +----------+ +---------+ +-------+ +--------+
      |
      v
+-----+-----+
|Take Test  |
+-----+-----+
      |
      v
+-----+-----+
|Completion |
+-----+-----+
      |
      +-------> Back to Dashboard
      +-------> View Results

                    +------------------+
                    |    AI Tutor      |
                    | (Always Available|
                    |   from Sidebar)  |
                    +------------------+
```

---

## Sidebar Navigation

The sidebar is always visible and provides quick access to all pages:

| Icon | Menu Item | Description |
|------|-----------|-------------|
| Home | Dashboard | Your main overview page |
| Chat | AI Tutor | Chat with AI learning assistant |
| Book | Practice Mode | Practice without pressure |
| Document | Assessments | View and take assessments |
| Activity | My Progress | Track your learning journey |
| Bar Chart | Results | View past results |
| Trophy | Achievements | Collect badges |

---

## Tips for Success

1. **Check your dashboard daily** - Track your streak and see new assessments
2. **Use Practice Mode** - Practice weak subjects before assessments
3. **Listen to feedback** - Use text-to-speech to hear explanations
4. **Aim for badges** - Gamification makes learning fun!
5. **Ask the AI Tutor** - Get help anytime you're stuck
6. **Review your results** - Learn from mistakes to improve
7. **Set goals** - Use the progress page to track your targets

---

## Accessibility Features

EduAssess is designed to be accessible for all students:

- **Text-to-Speech:** Click speaker icons to hear content read aloud
- **Large Text:** Student-friendly font sizes throughout
- **Color Coding:** Visual indicators for performance levels
- **Icons:** Easy subject identification
- **Simple Navigation:** Age-appropriate user experience

---

## Need Help?

If you have questions or need assistance:
- Use the AI Tutor for learning help
- Contact your teacher or administrator
- Check this guide for page-specific help

---
