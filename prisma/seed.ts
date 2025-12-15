import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as fs from 'fs';
import * as path from 'path';

// Create PrismaClient with libSQL adapter for Prisma 7.x
const adapter = new PrismaLibSql({
  url: 'file:./dev.db',  // Database is in root directory, not prisma folder
});
const prisma = new PrismaClient({ adapter });

// Load JSON data
const dummyDataPath = path.join(__dirname, '../data/dummyData.json');
const feedbackTemplatesPath = path.join(__dirname, '../data/feedbackTemplates.json');

const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf-8'));
const feedbackTemplates = JSON.parse(fs.readFileSync(feedbackTemplatesPath, 'utf-8'));

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.answer.deleteMany();
  await prisma.studentFeedback.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.observationIndicator.deleteMany();
  await prisma.classroomObservation.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.studentSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.observationTemplate.deleteMany();
  await prisma.indicatorTemplate.deleteMany();
  await prisma.feedbackTemplate.deleteMany();
  await prisma.questionTypeAnalysis.deleteMany();
  await prisma.subjectTip.deleteMany();

  // 1. Seed Users
  console.log('Seeding users...');
  for (const user of dummyData.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || null,
        grade: user.grade || null,
      },
    });
  }
  console.log(`Created ${dummyData.users.length} users`);

  // 2. Seed Students and their subjects
  console.log('Seeding students...');
  for (const student of dummyData.students) {
    await prisma.student.create({
      data: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        schoolId: student.schoolId,
        teacherId: student.teacherId,
        avatar: student.avatar || null,
        subjects: {
          create: student.subjects.map((subject: string) => ({
            subject,
          })),
        },
      },
    });
  }
  console.log(`Created ${dummyData.students.length} students`);

  // 3. Seed Assessments with Questions
  console.log('Seeding assessments...');
  for (const assessment of dummyData.assessments) {
    await prisma.assessment.create({
      data: {
        id: assessment.id,
        title: assessment.title,
        subject: assessment.subject,
        grade: assessment.grade,
        duration: assessment.duration,
        createdBy: assessment.createdBy,
        createdAt: new Date(assessment.createdAt),
        questions: {
          create: assessment.questions.map((q: any, index: number) => ({
            id: `${assessment.id}-${q.id}`,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: String(q.correctAnswer),
            points: q.points,
            hint: q.hint || null,
            fuzzyMatchingEnabled: q.fuzzyMatchingEnabled || false,
            similarityThreshold: q.similarityThreshold || null,
            orderIndex: index,
          })),
        },
      },
    });
  }
  console.log(`Created ${dummyData.assessments.length} assessments`);

  // 4. Seed Assessment Results with Answers
  console.log('Seeding assessment results...');
  for (const result of dummyData.results) {
    await prisma.assessmentResult.create({
      data: {
        id: result.id,
        assessmentId: result.assessmentId,
        studentId: result.studentId,
        studentName: result.studentName,
        grade: result.grade,
        subject: result.subject,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        completedAt: new Date(result.completedAt),
        status: result.status,
        answers: {
          create: result.answers.map((answer: any) => ({
            questionId: answer.questionId,
            answer: String(answer.answer),
            isCorrect: answer.isCorrect,
            points: answer.points,
            similarityScore: answer.similarityScore || null,
            matchingMethod: answer.matchingMethod || null,
          })),
        },
      },
    });
  }
  console.log(`Created ${dummyData.results.length} assessment results`);

  // 5. Seed Classroom Observations with Indicators
  console.log('Seeding classroom observations...');
  for (const observation of dummyData.observations) {
    await prisma.classroomObservation.create({
      data: {
        id: observation.id,
        teacherId: observation.teacherId,
        teacherName: observation.teacherName,
        observerId: observation.observerId,
        observerName: observation.observerName,
        schoolId: observation.schoolId,
        classGrade: observation.classGrade,
        subject: observation.subject,
        observationType: observation.observationType,
        date: new Date(observation.date),
        preObservationNotes: observation.preObservationNotes || null,
        overallScore: observation.overallScore,
        feedback: observation.feedback,
        recommendations: observation.recommendations ? JSON.stringify(observation.recommendations) : null,
        status: observation.status,
        createdAt: new Date(observation.createdAt),
        updatedAt: new Date(observation.updatedAt),
        indicators: {
          create: observation.indicators.map((indicator: any) => ({
            id: `${observation.id}-${indicator.id}`,
            name: indicator.name,
            score: indicator.score,
            maxScore: indicator.maxScore,
            notes: indicator.notes,
            timestamp: indicator.timestamp || null,
          })),
        },
      },
    });
  }
  console.log(`Created ${dummyData.observations.length} classroom observations`);

  // 6. Seed Activities
  console.log('Seeding activities...');
  for (const activity of dummyData.stats.recentActivity) {
    await prisma.activity.create({
      data: {
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: new Date(activity.timestamp),
        userId: activity.userId,
        userName: activity.userName,
      },
    });
  }
  console.log(`Created ${dummyData.stats.recentActivity.length} activities`);

  // 7. Seed Observation Templates
  console.log('Seeding observation templates...');
  for (const template of feedbackTemplates.observationTemplates) {
    await prisma.observationTemplate.create({
      data: {
        id: template.id,
        name: template.name,
        scoreRangeMin: template.scoreRange[0],
        scoreRangeMax: template.scoreRange[1],
        feedback: template.feedback,
        strengths: JSON.stringify(template.strengths),
        recommendations: JSON.stringify(template.recommendations),
      },
    });
  }
  console.log(`Created ${feedbackTemplates.observationTemplates.length} observation templates`);

  // 8. Seed Indicator Templates
  console.log('Seeding indicator templates...');
  for (const indicator of feedbackTemplates.indicators) {
    await prisma.indicatorTemplate.create({
      data: {
        id: indicator.id,
        name: indicator.name,
        description: indicator.description,
        maxScore: indicator.maxScore,
      },
    });
  }
  console.log(`Created ${feedbackTemplates.indicators.length} indicator templates`);

  // 9. Seed Student Feedback Templates
  console.log('Seeding feedback templates...');
  for (const tier of feedbackTemplates.studentFeedbackTemplates.performanceTiers) {
    for (const template of tier.templates) {
      await prisma.feedbackTemplate.create({
        data: {
          id: template.id,
          tierId: tier.id,
          tierName: tier.name,
          scoreRangeMin: tier.scoreRange[0],
          scoreRangeMax: tier.scoreRange[1],
          message: template.message,
          encouragement: template.encouragement,
          nextSteps: JSON.stringify(template.nextSteps),
        },
      });
    }
  }
  console.log('Created feedback templates');

  // 10. Seed Question Type Analysis
  console.log('Seeding question type analysis...');
  const questionTypeAnalysis = feedbackTemplates.studentFeedbackTemplates.questionTypeAnalysis;
  await prisma.questionTypeAnalysis.create({
    data: {
      questionType: 'multipleChoice',
      strength: questionTypeAnalysis.multipleChoice.strength,
      weakness: questionTypeAnalysis.multipleChoice.weakness,
    },
  });
  await prisma.questionTypeAnalysis.create({
    data: {
      questionType: 'trueFalse',
      strength: questionTypeAnalysis.trueFalse.strength,
      weakness: questionTypeAnalysis.trueFalse.weakness,
    },
  });
  await prisma.questionTypeAnalysis.create({
    data: {
      questionType: 'shortAnswer',
      strength: questionTypeAnalysis.shortAnswer.strength,
      weakness: questionTypeAnalysis.shortAnswer.weakness,
    },
  });
  console.log('Created 3 question type analysis entries');

  // 11. Seed Subject Tips
  console.log('Seeding subject tips...');
  const subjectTips = feedbackTemplates.studentFeedbackTemplates.subjectSpecificTips;
  for (const [subject, tips] of Object.entries(subjectTips) as [string, { general: string; lowScore: string }][]) {
    await prisma.subjectTip.create({
      data: {
        subject,
        general: tips.general,
        lowScore: tips.lowScore,
      },
    });
  }
  console.log('Created 3 subject tips');

  console.log('\nDatabase seeding completed successfully!');

  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Users: ${await prisma.user.count()}`);
  console.log(`Students: ${await prisma.student.count()}`);
  console.log(`Assessments: ${await prisma.assessment.count()}`);
  console.log(`Questions: ${await prisma.question.count()}`);
  console.log(`Results: ${await prisma.assessmentResult.count()}`);
  console.log(`Answers: ${await prisma.answer.count()}`);
  console.log(`Observations: ${await prisma.classroomObservation.count()}`);
  console.log(`Activities: ${await prisma.activity.count()}`);
  console.log(`Observation Templates: ${await prisma.observationTemplate.count()}`);
  console.log(`Indicator Templates: ${await prisma.indicatorTemplate.count()}`);
  console.log(`Feedback Templates: ${await prisma.feedbackTemplate.count()}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
