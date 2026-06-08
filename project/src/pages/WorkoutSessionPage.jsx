import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const defaultPlans = [
  { id: 'chest', name: 'Chest', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Chest Flyes'] },
  { id: 'legs', name: 'Legs', exercises: ['Squats', 'Lunges', 'Leg Press'] },
  { id: 'shoulders', name: 'Shoulders', exercises: ['Lateral Raise', 'Front Raise'] },
  { id: 'back', name: 'Back', exercises: ['Deadlift', 'Pull-ups'] },
  { id: 'arms', name: 'Arms', exercises: ['Bicep Curls', 'Push Ups'] },
];

const defaultExerciseDetails = {
  'Bench Press': {
    instructions: 'Lie flat on a bench, grip the barbell slightly wider than shoulder width, lower it to your chest, and press back up.',
    tutorialUrl: 'https://www.youtube.com/embed/lWFknlOTbyM?si=4-hrwENfOVYipveT&t=3',
  },
  'Incline Dumbbell Press': {
    instructions: 'Set bench to incline, hold dumbbells at shoulder height, press upward and slightly forward, then lower with control.',
    tutorialUrl: 'https://www.youtube.com/embed/IP4oeKh1Sd4?si=2VJlrNs_bhN6hMNw&t=3',
  },
  'Chest Flyes': {
    instructions: 'Lie on bench with slight elbow bend, bring dumbbells in an arc motion, squeeze at the top, lower back with control.',
    tutorialUrl: 'https://www.youtube.com/embed/g3T7LsEeDWQ?si=-AU3uTA6_wtOwzp0',
  },
  'Push Ups': {
    instructions: 'Place hands slightly wider than shoulder width, keep body in a straight line, lower chest to just above the floor and push back up.',
    tutorialUrl: 'https://www.youtube.com/embed/mECzqUIDWfU?si=FAcUyzo3TKPT_Ibg',
  },
  'Squats': {
    instructions: 'Stand with feet shoulder-width apart, lower hips back as if sitting in a chair, keep chest up, press through heels to stand.',
    tutorialUrl: 'https://www.youtube.com/embed/xqvCmoLULNY?si=APxj5ts-_mz6ykLr',
  },
  'Lunges': {
    instructions: 'Step forward, lower hips until both knees are at 90 degrees, push back to starting position, alternate legs.',
    tutorialUrl: 'https://www.youtube.com/embed/ASdqJoDPMHA?si=qaBCNxj1zjo4FNLK',
  },
  'Leg Press': {
    instructions: 'Sit with back and head against pad, place feet on platform, lower weight by bending knees, push back to starting position.',
    tutorialUrl: 'https://www.youtube.com/embed/8EMbB0tCn7Q?si=yk0VH3II_Bjok5zB',
  },
  'Lateral Raise': {
    instructions: 'Stand with dumbbells at sides, raise arms to shoulder height with slight elbow bend, lower with control.',
    tutorialUrl: 'https://www.youtube.com/embed/kDqklk1ZESo?si=RTJ-WGSmHSNJMrUU',
  },
  'Front Raise': {
    instructions: 'Stand with dumbbells in front of thighs, raise arms to shoulder height, lower back to starting position.',
    tutorialUrl: 'https://www.youtube.com/embed/gzDawZwDC6Y?si=dWm-vaFfZ69gn7K_',
  },
  'Deadlift': {
    instructions: 'Stand over bar with feet hip-width apart, grip outside legs, keep back straight, pull bar up along your body.',
    tutorialUrl: 'https://www.youtube.com/embed/r4MzxtBKyNE?si=YOX8WNPuGtrT9uSJ',
  },
  'Pull-ups': {
    instructions: 'Grip bar slightly wider than shoulders, hang with straight arms, pull body up until chin clears bar, lower with control.',
    tutorialUrl: 'https://www.youtube.com/embed/OEXosPwzFdc?si=UAEcWUQjUWGB3KZZ',
  },
  'Bicep Curls': {
    instructions: 'Stand with dumbbells at sides, curl weights up while keeping elbows stationary, lower back down.',
    tutorialUrl: 'https://www.youtube.com/embed/scZFlj11eck?si=gG3RFSDY89jjMESP',
  },
};

const WorkoutSessionPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('workout_plans');
      const savedPlans = raw ? JSON.parse(raw) : defaultPlans;
      const foundPlan = savedPlans.find((p) => p.id === planId);
      if (!foundPlan) {
        const defaultPlan = defaultPlans.find((p) => p.id === planId);
        setPlan(defaultPlan);
      } else {
        setPlan(foundPlan);
      }
    } catch {
      const defaultPlan = defaultPlans.find((p) => p.id === planId);
      setPlan(defaultPlan);
    }
  }, [planId]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Workout plan not found</p>
          <button onClick={() => navigate('/workout-planner')} className="bg-[#178582] hover:bg-teal-700 text-white px-4 py-2 rounded-md">
            Back to Planner
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = plan.exercises[currentExerciseIndex];
  const exerciseDetail = defaultExerciseDetails[currentExercise] || { instructions: 'No instructions available', tutorialUrl: '' };
  const isLastExercise = currentExerciseIndex === plan.exercises.length - 1;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#178582]">{plan.name} Workout</h1>
            <p className="text-gray-600 mt-2">Exercise {currentExerciseIndex + 1} of {plan.exercises.length}</p>
          </div>
          <button onClick={() => navigate('/workout-planner')} className="text-gray-600 hover:text-gray-900 font-medium">
            ← Back
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-[#178582]">{currentExerciseIndex + 1}/{plan.exercises.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#178582] h-2 rounded-full transition-all"
              style={{ width: `${((currentExerciseIndex + 1) / plan.exercises.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Exercise Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Exercise Name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentExercise}</h2>

          {/* Instructions Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Instructions</h3>
            <p className="text-gray-700 leading-relaxed">{exerciseDetail.instructions}</p>
          </div>

          {/* Tutorial Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">▶️ Tutorial</h3>
            {exerciseDetail.tutorialUrl ? (
              <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={exerciseDetail.tutorialUrl}
                  title={`${currentExercise} Tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                <p>No tutorial available for this exercise</p>
              </div>
            )}
          </div>

          {/* Pose Correction Button */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎥 Form Check</h3>
            <p className="text-gray-700 mb-4">Use AI-powered pose correction to check your form and ensure you're performing the exercise correctly.</p>
            <button
              onClick={() => navigate(`/pose-correction/${encodeURIComponent(currentExercise)}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
            >
              Open Pose Correction
            </button>
          </div>

          {/* Notes Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Tip:</span> Focus on form over weight. Control each rep and avoid using momentum.
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium transition"
          >
            ← Previous Exercise
          </button>

          {isLastExercise && (
            <button
              onClick={() => navigate('/workout-planner')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition"
            >
              ✓ Complete Workout
            </button>
          )}

          <button
            onClick={() => setCurrentExerciseIndex(Math.min(plan.exercises.length - 1, currentExerciseIndex + 1))}
            disabled={currentExerciseIndex === plan.exercises.length - 1}
            className="bg-[#178582] hover:bg-teal-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium transition"
          >
            Next Exercise →
          </button>
        </div>

        {/* Exercise List Sidebar */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {plan.exercises.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentExerciseIndex(idx)}
                className={`p-3 rounded-lg text-left transition ${
                  idx === currentExerciseIndex
                    ? 'bg-[#178582] text-white font-semibold'
                    : idx < currentExerciseIndex
                    ? 'bg-green-50 text-gray-900 border border-green-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {idx < currentExerciseIndex ? '✓ ' : ''}{ex}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkoutSessionPage;
