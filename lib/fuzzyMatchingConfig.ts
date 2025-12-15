// Fuzzy Matching Configuration for Short-Answer Questions
// Uses string-similarity (Dice coefficient algorithm)

export interface FuzzyMatchingConfig {
  enabled: boolean;
  defaultThreshold: number;
  subjectThresholds?: {
    Mathematics?: number;
    English?: number;
    Urdu?: number;
  };
  strictMode?: boolean; // If true, only use fuzzy after exact match fails
}

export const FUZZY_MATCHING_CONFIG: FuzzyMatchingConfig = {
  enabled: true,
  defaultThreshold: 0.80, // 80% similarity required by default
  subjectThresholds: {
    Mathematics: 0.85, // Higher threshold for math (less tolerance for variations)
    English: 0.75,     // Lower threshold for English (more tolerance for spelling)
    Urdu: 0.75,        // Lower threshold for Urdu (more tolerance for spelling)
  },
  strictMode: true, // Try exact match first for performance
};

/**
 * Get the similarity threshold for a specific subject
 * @param subject - Subject name (Mathematics, English, Urdu)
 * @param customThreshold - Optional custom threshold override
 * @returns Threshold value between 0 and 1
 */
export function getThresholdForSubject(
  subject: string,
  customThreshold?: number
): number {
  // If custom threshold provided, use it
  if (customThreshold !== undefined) {
    return customThreshold;
  }

  // Return subject-specific threshold or default
  const subjectKey = subject as keyof typeof FUZZY_MATCHING_CONFIG.subjectThresholds;
  return (
    FUZZY_MATCHING_CONFIG.subjectThresholds?.[subjectKey] ??
    FUZZY_MATCHING_CONFIG.defaultThreshold
  );
}

/**
 * Optional: Calculate partial credit based on similarity score
 * Currently disabled for MVP (binary scoring)
 */
export const PARTIAL_CREDIT_BANDS = {
  enabled: false, // Disabled for MVP, can be enabled later
  bands: [
    { minSimilarity: 0.90, creditPercent: 100 }, // 90%+ = full credit
    { minSimilarity: 0.80, creditPercent: 90 },  // 80-89% = 90% credit
    { minSimilarity: 0.70, creditPercent: 75 },  // 70-79% = 75% credit
    { minSimilarity: 0.60, creditPercent: 50 },  // 60-69% = 50% credit
    { minSimilarity: 0.00, creditPercent: 0 },   // <60% = no credit
  ],
};

/**
 * Calculate points based on similarity score
 * If partial credit is disabled, returns full points or 0
 * @param similarityScore - Similarity between 0 and 1
 * @param maxPoints - Maximum points for the question
 * @param threshold - Minimum threshold to pass
 * @returns Points awarded
 */
export function calculatePartialCredit(
  similarityScore: number,
  maxPoints: number,
  threshold: number
): number {
  // If partial credit disabled, use binary scoring
  if (!PARTIAL_CREDIT_BANDS.enabled) {
    return similarityScore >= threshold ? maxPoints : 0;
  }

  // Find appropriate credit band
  for (const band of PARTIAL_CREDIT_BANDS.bands) {
    if (similarityScore >= band.minSimilarity) {
      return Math.round((maxPoints * band.creditPercent) / 100);
    }
  }

  return 0;
}
