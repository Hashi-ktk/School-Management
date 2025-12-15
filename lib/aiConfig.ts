/**
 * AI/ML Feature Configuration
 * Centralized configuration for all AI-powered features in the application
 */

export const aiConfig = {
  // Student Grouping Configuration
  grouping: {
    // Score thresholds for TaRL grouping levels
    thresholds: {
      beginner: 40,      // 0-40%
      developing: 60,    // 41-60%
      proficient: 80,    // 61-80%
      advanced: 100,     // 81-100%
    },
    // Group size constraints
    minGroupSize: 2,
    maxGroupSize: 10,
    // Enable subject-specific grouping
    subjectSpecificGrouping: true,
  },

  // Adaptive Learning Configuration
  adaptive: {
    // Question limits
    minQuestions: 5,
    maxQuestions: 15,
    // Stopping rule thresholds
    floorThreshold: 3,      // Consecutive wrong at lowest difficulty
    ceilingThreshold: 3,    // Consecutive correct at highest difficulty
    // Ability adjustment rate (how fast ability estimate changes)
    abilityAdjustmentRate: 0.3,
    // Difficulty levels
    difficultyLevels: {
      min: 1,
      max: 4,
      default: 2,
    },
    // Initial ability based on grade level
    initialAbilityByGrade: {
      1: 1.5,
      2: 1.8,
      3: 2.0,
      4: 2.2,
      5: 2.5,
    } as Record<number, number>,
  },

  // At-Risk Prediction Configuration
  risk: {
    // Risk level thresholds
    highRiskThreshold: 70,
    mediumRiskThreshold: 40,
    // Risk factor weights (must sum to 1.0)
    weights: {
      // Academic factors (60%)
      currentScore: 0.20,
      scoreTrend: 0.15,
      failedAssessments: 0.15,
      lowestSubjectScore: 0.10,
      // Engagement factors (25%)
      missedAssessments: 0.10,
      assessmentFrequency: 0.10,
      incompleteAssessments: 0.05,
      // Pattern factors (15%)
      consecutiveLowScores: 0.10,
      volatility: 0.05,
    },
    // Thresholds for risk factors
    factorThresholds: {
      lowScore: 60,
      veryLowScore: 40,
      decliningTrendThreshold: -10,
      missedAssessmentsThreshold: 2,
      daysSinceAssessmentThreshold: 14,
      consecutiveLowThreshold: 3,
      volatilityThreshold: 20,
    },
    // Alert settings
    alertCooldownDays: 7,
  },

  // Intervention Recommendations Configuration
  interventions: {
    // Maximum recommendations per student
    maxRecommendations: 5,
    // Priority levels
    priorityLevels: ['critical', 'high', 'medium', 'low'] as const,
    // Minimum score to trigger intervention
    interventionThreshold: 70,
    // Categories
    categories: [
      'foundational',
      'skill-gap',
      'question-type',
      'consistency',
      'advancement',
    ] as const,
  },
};

export type GroupingLevel = 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';
export type RiskLevel = 'high' | 'medium' | 'low';
export type InterventionPriority = typeof aiConfig.interventions.priorityLevels[number];
export type InterventionCategory = typeof aiConfig.interventions.categories[number];
