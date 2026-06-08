import React, { useState } from 'react';
import { createMealPlan } from '../services/api';

export default function MealPlannerPage() {
  const [goal, setGoal] = useState('');
  const [dietType, setDietType] = useState('Vegetarian');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [chunkSize, setChunkSize] = useState('');
  const [chunkIndex, setChunkIndex] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        goal,
        dietType,
        weightKg: weightKg ? Number(weightKg) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        activityLevel,
        userEmail: saveToProfile ? userEmail : undefined,
        saveToProfile: saveToProfile || undefined,
        chunkSize: chunkSize ? Number(chunkSize) : undefined,
        chunkIndex: chunkIndex ? Number(chunkIndex) : undefined,
      };
      const res = await createMealPlan(payload);
      setResult(res);
    } catch (err) {
      console.error('Meal plan error', err);
      setError(err?.response?.data || err.message || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Meal Planner</h2>
      <p className="text-gray-600 mb-6">Generate a compact 7-day meal plan tailored to your goals.</p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your goal</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Lose 5kg in 2 months, gain lean muscle" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Diet type</label>
          <div className="mt-2 flex items-center gap-4">
            <label className="inline-flex items-center">
              <input type="radio" name="diet" checked={dietType === 'Vegetarian'} onChange={() => setDietType('Vegetarian')} className="mr-2" />
              Vegetarian
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="diet" checked={dietType === 'Non-vegetarian'} onChange={() => setDietType('Non-vegetarian')} className="mr-2" />
              Non-vegetarian
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Activity</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} className="mr-2" />
            Save to profile
          </label>
          {saveToProfile && (
            <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="you@example.com" className="mt-0 block rounded-md border-gray-300 shadow-sm" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chunk size (optional)</label>
            <input value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} placeholder="e.g. 3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chunk start index (optional)</label>
            <input value={chunkIndex} onChange={(e) => setChunkIndex(e.target.value)} placeholder="e.g. 0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">{loading ? 'Generating...' : 'Create Plan'}</button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-6">{typeof error === 'string' ? error : JSON.stringify(error)}</div>
      )}

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{result.result?.summary || result.result?.raw || 'Meal plan'}</h3>

          <div className="max-h-96 overflow-auto border rounded p-3 bg-gray-50">
            {result.result?.days && result.result.days.length > 0 ? (
              result.result.days.map((d, i) => (
                <div key={i} className="mb-3">
                  <div className="font-semibold">{d.day} (Estimated {d.totalCalories || '~1500'} kcal)</div>
                  <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {d.meals && Object.entries(d.meals).map(([mealName, items]) => (
                      <div key={mealName} className="p-2 bg-white rounded shadow-sm">
                        <div className="font-semibold">{mealName}</div>
                        <ul className="text-sm mt-1">
                          {Array.isArray(items) && items.map((it, idx) => (
                            <li key={idx}>{it?.name || 'Item'} — {it?.serving || ''} — {it?.calories || 0} kcal</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No meal plan days found</p>
            )}
          </div>

          <div>
            <h6 className="font-semibold">Notes</h6>
            <div className="mt-2">
              {result.result?.notes && result.result.notes.length > 0 ? (
                <ul className="text-sm list-disc ml-5">
                  {result.result.notes.map((note, nidx) => (
                    <li key={nidx}>{note}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No additional notes</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
