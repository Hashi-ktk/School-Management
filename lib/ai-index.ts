/**
 * AI/ML Feature Libraries
 * Central export for all AI-related functionality
 */

// Configuration
export * from './aiConfig';

// Student Grouping (TaRL)
export {
  groupStudentsForTaRL,
  groupStudentsByCompetency,
  generateMixedAbilityGroups,
  determineGroupingLevel,
  prepareStudentForGrouping,
  suggestRegrouping,
  getGroupingSummary,
} from './studentGrouping';

export type {
  StudentGroupingInput,
  StudentGroup,
  GroupingResult,
  SubjectScore,
} from './studentGrouping';

// Adaptive Learning
export {
  initializeAdaptiveSession,
  updateAbilityEstimate,
  selectNextQuestion,
  checkStoppingRule,
  calculateCompetencyLevel,
  generateSessionResult,
  prepareAdaptiveQuestionPool,
  assignQuestionDifficulty,
  saveAdaptiveSession,
  getAdaptiveSession,
  getAdaptiveSessions,
  deleteAdaptiveSession,
} from './adaptiveLearning';

export type {
  AdaptiveState,
  AdaptiveQuestion,
  NextQuestionResult,
  AdaptiveSessionResult,
  StoppingReason,
  CompetencyLevel,
} from './adaptiveLearning';

// Intervention Recommendations
export {
  createInterventionPlan,
  buildStudentContext,
  analyzeStudentNeeds,
  generateInterventions,
  prioritizeInterventions,
  getAtRiskInterventionPlans,
} from './interventionRecommendations';

export type {
  StudentContext,
  SubjectPerformance,
  QuestionTypePerformance,
  Activity,
  Resource,
  Checkpoint,
  Intervention,
  InterventionPlan,
  WeeklyFocus,
} from './interventionRecommendations';

// At-Risk Prediction
export {
  calculateStudentRisk,
  calculateClassRisk,
  generateRiskAlerts,
  getStudentsByRiskLevel,
  getRiskHistory,
  saveRiskAlerts,
  getStoredRiskAlerts,
  acknowledgeAlert,
  getUnacknowledgedAlertCount,
} from './atRiskPrediction';

export type {
  RiskFactors,
  RiskTrigger,
  RiskAssessment,
  ClassRiskSummary,
  RiskAlert,
  RiskHistoryEntry,
} from './atRiskPrediction';
