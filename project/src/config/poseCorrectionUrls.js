/**
 * Centralized configuration for pose correction URLs
 * Each workout/exercise has its own URL for pose correction
 * 
 * To add a new workout URL, simply add an entry here with the exercise name as the key
 * and the corresponding Gradio/deployment URL as the value.
 */

export const POSE_CORRECTION_URLS = {
  // Example URL - replace with your actual URLs
  'Squats': '', // Add your URL here
  'Push Ups': '', // Add your URL here
  'Lunges': '', // Add your URL here
  'Leg Press': '', // Add your URL here
  'Bench Press': '', // Add your URL here
  'Incline Dumbbell Press': '', // Add your URL here
  'Chest Flyes': '', // Add your URL here
  'Lateral Raise': '', // Add your URL here
  'Front Raise': '', // Add your URL here
  'Deadlift': '', // Add your URL here
  'Pull-ups': '', // Add your URL here
  'Bicep Curls': '', // Add your URL here
};

/**
 * Get the pose correction URL for a specific exercise
 * @param {string} exerciseName - The name of the exercise
 * @returns {string|null} - The URL for the exercise, or null if not found
 */
export const getPoseCorrectionUrl = (exerciseName) => {
  return POSE_CORRECTION_URLS[exerciseName] || null;
};

/**
 * Check if a pose correction URL exists for an exercise
 * @param {string} exerciseName - The name of the exercise
 * @returns {boolean} - True if URL exists, false otherwise
 */
export const hasPoseCorrectionUrl = (exerciseName) => {
  const url = getPoseCorrectionUrl(exerciseName);
  return url !== null && url !== '';
};

