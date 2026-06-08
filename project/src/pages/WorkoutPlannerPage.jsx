import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Allowed exercises for creation (only these will be selectable)
const ALLOWED_EXERCISES = [
  'Squats',
  'Push Ups',
  'Lunges',
  'Leg Press',
  'Bench Press',
  'Incline Dumbbell Press',
  'Chest Flyes',
  'Lateral Raise',
  'Deadlift',
  'Pull-ups',
  'Bicep Curls',
  'Front Raise',
];

const defaultPlans = [
  { id: 'chest', name: 'Chest', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Chest Flyes'] },
  { id: 'legs', name: 'Legs', exercises: ['Squats', 'Lunges', 'Leg Press'] },
  { id: 'shoulders', name: 'Shoulders', exercises: ['Lateral Raise', 'Front Raise'] },
  { id: 'back', name: 'Back', exercises: ['Deadlift', 'Pull-ups'] },
  { id: 'arms', name: 'Arms', exercises: ['Bicep Curls', 'Push Ups'] },
];

const WorkoutPlannerPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => {
    try {
      const raw = localStorage.getItem('workout_plans');
      if (!raw) return defaultPlans;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultPlans;
      // Sanitize: keep only allowed exercises and drop empty plans
      const sanitized = parsed
        .map((pl) => ({
          ...pl,
          exercises: Array.isArray(pl.exercises)
            ? pl.exercises.filter((ex) => ALLOWED_EXERCISES.includes(ex))
            : [],
        }))
        .filter((pl) => pl.exercises && pl.exercises.length);
      return sanitized.length ? sanitized : defaultPlans;
    } catch {
      return defaultPlans;
    }
  });
  const [newName, setNewName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('workout_plans', JSON.stringify(plans));
    } catch {
      /* ignore storage errors */
    }
  }, [plans]);

  const addPlan = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const exercises = selectedExercises.filter((ex) => ALLOWED_EXERCISES.includes(ex));
    if (!exercises.length) return; // require at least one exercise
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const plan = { id, name, exercises };
    setPlans((p) => [plan, ...p]);
    setNewName('');
    setSelectedExercises([]);
  };

  const startPlan = (id) => {
    navigate(`/workout-session/${id}`);
  };

  const removePlan = (id) => {
    setPlans((p) => p.filter((pl) => pl.id !== id));
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 flex justify-center">
      <div className="w-full max-w-5xl px-4">
        <h1 className="text-3xl font-bold text-[#178582] mb-6">Workout Planner</h1>
        <p className="text-gray-700 mb-8">Choose a plan to start training or add your own custom workout (comma-separated exercises).</p>

        <section className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create a New Workout</h2>
          <form onSubmit={addPlan} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Workout Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. Upper Body Blast" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Exercises</label>
              <div className="mt-1 flex items-center space-x-2">
                <div className="relative flex-1">
                  <select
                    value={selectedExercises._temp || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      // add selected exercise if not already added
                      setSelectedExercises((prev) => (prev.includes(val) ? prev : [...prev, val]));
                      // reset the select to placeholder
                      e.target.selectedIndex = 0;
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm appearance-none pr-10"
                  >
                    <option value="">Select an exercise...</option>
                    {ALLOWED_EXERCISES.map((ex) => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                  {/* down arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 12a1 1 0 01-.7-.3l-3-3a1 1 0 111.4-1.4L10 9.6l2.3-2.3a1 1 0 011.4 1.4l-3 3A1 1 0 0110 12z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExercises([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>

              {/* Selected exercises chips */}
              <div className="mt-3 min-h-[48px] p-2 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap gap-2">
                {selectedExercises.length === 0 ? (
                  <span className="text-sm text-gray-400">No exercises selected yet</span>
                ) : (
                  selectedExercises.map((ex) => (
                    <div key={ex} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-sm">
                      <span className="mr-2">{ex}</span>
                      <button onClick={() => setSelectedExercises((p) => p.filter((x) => x !== ex))} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <button type="submit" className="bg-[#178582] hover:bg-teal-700 text-white px-4 py-2 rounded-md">Add Workout</button>
            </div>
          </form>
        </section>

        <section className="grid gap-4">
          {plans.map((plan) => (
            <div key={plan.id} id={`plan-${plan.id}`} className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <ul className="mt-2 text-gray-700 list-disc list-inside">
                  {plan.exercises && plan.exercises.length ? (
                    plan.exercises.map((ex, i) => <li key={i}>{ex}</li>)
                  ) : (
                    <li className="text-gray-400">No exercises listed</li>
                  )}
                </ul>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <button onClick={() => startPlan(plan.id)} className="bg-[#178582] hover:bg-teal-700 text-white px-4 py-2 rounded-md">Start</button>
                <button onClick={() => removePlan(plan.id)} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default WorkoutPlannerPage;
