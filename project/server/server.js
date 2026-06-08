import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Trainer Schema
const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String, required: true },
  availability: [{ type: String }],
  rating: { type: Number, default: 4.5 }
}, { timestamps: true });

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  trainerName: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  joinCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'booked', 'completed', 'cancelled'], default: 'booked' },
  isOneTimeOnly: { type: Boolean, default: true }
}, { timestamps: true });

// Create models
const Trainer = mongoose.model('Trainer', trainerSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// MealPlan schema
const mealPlanSchema = new mongoose.Schema({
  userEmail: { type: String },
  goal: { type: String },
  dietType: { type: String },
  weightKg: { type: Number },
  heightCm: { type: Number },
  activityLevel: { type: String },
  result: { type: mongoose.Schema.Types.Mixed }, // store JSON result from AI
}, { timestamps: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

// Routes

// Get all trainers
app.get('/api/trainers', async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trainer by ID
app.get('/api/trainers/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get booking by session ID
app.get('/api/bookings/session/:sessionId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ sessionId: req.params.sessionId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings by user email
app.get('/api/bookings/user/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.params.email });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to list available models (for debugging)
async function listAvailableModels(apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      console.log('Available models:', data.models?.map(m => m.name).join(', ') || 'None found');
      return data.models || [];
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
  return [];
}

// Helper function to generate meal plan chunk
async function generateMealPlanChunk(apiKey, goal, dietType, weightKg, heightCm, activityLevel, daysToGenerate, startDay, retryWithMoreTokens = false, modelIndex = 0) {
  // Ultra-compact prompt - minimize tokens
  const prompt = `JSON only:
{"summary":"string","days":[{"day":"Day N","meals":{"breakfast":[{"name":"string","serving":"string","calories":number}],"lunch":[{"name":"string","serving":"string","calories":number}],"dinner":[{"name":"string","serving":"string","calories":number}],"snacks":[{"name":"string","serving":"string","calories":number}]},"totalCalories":number}],"notes":["string"]}
${daysToGenerate} day${daysToGenerate > 1 ? 's' : ''} from Day ${startDay + 1}. Goal:${goal}. Diet:${dietType}. W:${weightKg||'?'}kg H:${heightCm||'?'}cm Act:${activityLevel||'mod'}. Include calories for each meal.`;

  // Use available models from the API - these are the actual models available
  // Based on API response: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, etc.
  const modelNames = [
    'gemini-2.5-flash',  // Fast and efficient
    'gemini-2.5-pro',    // More capable
    'gemini-2.0-flash',  // Alternative
    'gemini-2.0-flash-001' // Backup
  ];
  
  const modelName = modelNames[modelIndex] || modelNames[0];
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  console.log(`Trying model: ${modelName} for chunk ${startDay}-${startDay + daysToGenerate - 1}`);
  
  // Calculate optimal token limit - be generous to avoid truncation
  // Estimate: ~400-500 tokens per day (realistic for meal plans with calories), add buffer
  const estimatedTokensPerDay = 500;
  const baseTokens = 300;
  let calculatedMaxTokens = (daysToGenerate * estimatedTokensPerDay) + baseTokens;
  
  // If retrying after MAX_TOKENS, increase to maximum
  if (retryWithMoreTokens) {
    calculatedMaxTokens = 8192; // Use maximum tokens for retry
  }
  
  // Cap at 8192 (model max)
  calculatedMaxTokens = Math.min(calculatedMaxTokens, 8192);
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: calculatedMaxTokens,
    }
  };

  console.log(`Making API request for chunk ${startDay}-${startDay + daysToGenerate - 1} with maxOutputTokens: ${calculatedMaxTokens}`);
  
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!resp.ok) {
    const errorText = await resp.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      errorData = { error: { message: errorText } };
    }
    
    // If model not found, try next model in list
    if (resp.status === 404 && errorData.error?.message?.includes('not found')) {
      if (modelIndex < modelNames.length - 1) {
        const nextModelIndex = modelIndex + 1;
        const nextModel = modelNames[nextModelIndex];
        console.log(`Model ${modelName} not found, trying ${nextModel}...`);
        // Retry with next model
        return await generateMealPlanChunk(apiKey, goal, dietType, weightKg, heightCm, activityLevel, daysToGenerate, startDay, retryWithMoreTokens, nextModelIndex);
      } else {
        // All models tried, list available models
        console.error('All model names failed. Listing available models...');
        await listAvailableModels(apiKey);
      }
    }
    
    console.error(`API error response (${resp.status}):`, errorText);
    throw new Error(`API returned ${resp.status}: ${errorText}`);
  }
  
  const data = await resp.json();
  console.log(`API response received. Has candidates: ${!!data.candidates}, candidates length: ${data.candidates?.length || 0}`);
  
  // Check for prompt feedback (blocked prompts)
  if (data.promptFeedback) {
    if (data.promptFeedback.blockReason) {
      throw new Error(`Prompt blocked: ${data.promptFeedback.blockReason}`);
    }
  }
  
  // Check if candidates array exists and has items
  if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    console.error('No candidates in response:', JSON.stringify(data, null, 2));
    throw new Error('No candidates in API response - check API key and model availability');
  }
  
  const candidate = data.candidates[0];
  
  // Check for safety ratings or blocked content
  if (candidate.safetyRatings) {
    const blocked = candidate.safetyRatings.some(r => r.blocked === true);
    if (blocked) {
      const blockedReasons = candidate.safetyRatings
        .filter(r => r.blocked)
        .map(r => `${r.category}:${r.probability}`)
        .join(', ');
      throw new Error(`Content blocked by safety filters: ${blockedReasons}`);
    }
  }
  
  // Check finish reason
  if (candidate.finishReason) {
    console.log(`Finish reason for chunk ${startDay}-${startDay + daysToGenerate - 1}:`, candidate.finishReason);
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      throw new Error(`Content blocked: ${candidate.finishReason}`);
    }
  }
  
  let text = '';
  
  // Try multiple ways to extract text from Gemini response
  if (candidate.content && candidate.content.parts) {
    // Standard format: parts array
    for (const part of candidate.content.parts) {
      if (part.text) {
        text += part.text;
      }
    }
  } else if (candidate.content && candidate.content.text) {
    // Direct text property
    text = candidate.content.text;
  } else if (candidate.text) {
    // Candidate has text directly
    text = candidate.text;
  } else if (candidate.output) {
    text = candidate.output;
  } else if (data.text) {
    // Response has text directly
    text = data.text;
  } else if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
    text = data.outputs[0];
  }
  
  if (!text) {
    // Log the full response for debugging
    console.error('=== FULL API RESPONSE (no text found) ===');
    console.error(JSON.stringify(data, null, 2));
    console.error('=== Candidate structure ===');
    console.error(JSON.stringify(candidate, null, 2));
    console.error('=== Candidate content ===');
    console.error(JSON.stringify(candidate?.content, null, 2));
    console.error('=== END DEBUG INFO ===');
    throw new Error(`No text content in API response. Finish reason: ${candidate.finishReason || 'unknown'}`);
  }
  
  console.log(`✓ Extracted ${text.length} characters from API response`);
  
  // Check for MAX_TOKENS - if hit and not retrying yet, retry with more tokens
  if (candidate && (candidate.finishReason === 'MAX_TOKENS' || candidate.finishReason === 'max_tokens')) {
    if (!retryWithMoreTokens) {
      console.log(`MAX_TOKENS hit for chunk ${startDay}-${startDay + daysToGenerate - 1}, retrying with more tokens...`);
      return await generateMealPlanChunk(apiKey, goal, dietType, weightKg, heightCm, activityLevel, daysToGenerate, startDay, true, modelIndex);
    } else {
      // Even with retry, still hit limit - try to parse partial JSON
      console.warn(`MAX_TOKENS hit even after retry, attempting to parse partial response...`);
    }
  }
  
  // Clean and parse JSON
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    const parsed = JSON.parse(cleanText);
    // Validate we got at least some days
    if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
      return parsed;
    } else {
      throw new Error('Parsed JSON but no days found');
    }
  } catch (parseErr) {
    // Try to fix truncated JSON
    console.log('Attempting to fix truncated JSON...');
    let fixedJson = cleanText;
    
    // Count braces to see if JSON is incomplete
    const openBraces = (fixedJson.match(/\{/g) || []).length;
    const closeBraces = (fixedJson.match(/\}/g) || []).length;
    const openBrackets = (fixedJson.match(/\[/g) || []).length;
    const closeBrackets = (fixedJson.match(/\]/g) || []).length;
    
    // If truncated, try to close incomplete structures
    if (openBraces > closeBraces || openBrackets > closeBrackets) {
      // Find the last incomplete structure and try to close it
      let lastOpenBrace = fixedJson.lastIndexOf('{');
      let lastOpenBracket = fixedJson.lastIndexOf('[');
      
      // Try to close arrays first, then objects
      if (openBrackets > closeBrackets) {
        fixedJson += ']'.repeat(openBrackets - closeBrackets);
      }
      if (openBraces > closeBraces) {
        fixedJson += '}'.repeat(openBraces - closeBraces);
      }
      
      // Try parsing the fixed JSON
      try {
        const parsed = JSON.parse(fixedJson);
        if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
          console.log('✓ Successfully parsed fixed truncated JSON');
          return parsed;
        }
      } catch (fixErr) {
        console.log('Fixed JSON still invalid, trying regex extraction...');
      }
    }
    
    // Try regex extraction as fallback
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
          console.log('✓ Successfully parsed extracted JSON');
          return parsed;
        }
      } catch (e) {
        // Continue to error
      }
    }
    
    // If all else fails, log the problematic text
    console.error('JSON parsing failed. Text length:', cleanText.length);
    console.error('Last 200 chars:', cleanText.substring(Math.max(0, cleanText.length - 200)));
    throw new Error(`JSON parsing failed: ${parseErr.message}. Response may be truncated.`);
  }
}

// Meal plan generation endpoint
app.post('/api/meal-plan', async (req, res) => {
  try {
    const { goal, dietType, weightKg, heightCm, activityLevel, userEmail, saveToProfile, chunkSize, chunkIndex } = req.body;

    // Default to 3 days meal plan (reduced from 7)
    const totalDays = 3;
    const optimalChunkSize = 3; // Process all 3 days at once (smaller, simpler)
    let daysToGenerate = totalDays;
    let startDay = 0;
    let useAutoChunking = false;
    
    // Use provided chunking or enable auto-chunking
    if (chunkSize && Number.isInteger(chunkSize) && Number(chunkSize) > 0) {
      daysToGenerate = Number(chunkSize);
      startDay = Number(chunkIndex) || 0;
    } else {
      // For 3 days, generate all at once (no chunking needed)
      daysToGenerate = totalDays;
      startDay = 0;
      useAutoChunking = false; // No chunking needed for 3 days
    }

    let finalResult = null;
    const apiKey = process.env.GENERATIVE_API_KEY;
    
    if (apiKey) {
      try {
        // Generate meal plan (3 days default, no chunking needed)
        finalResult = await generateMealPlanChunk(
          apiKey, goal, dietType, weightKg, heightCm, activityLevel,
          daysToGenerate, startDay
        );
        console.log(`✓ Successfully generated ${daysToGenerate} day(s) meal plan`);
      } catch (fetchErr) {
        console.error('Meal plan generation error:', fetchErr);
        finalResult = { 
          error: `Failed to generate meal plan: ${fetchErr.message}`,
          suggestion: useAutoChunking ? 'Auto-chunking failed. Try manual chunking.' : 'Try using chunking (chunkSize=3) to generate smaller responses'
        };
      }
    } else {
      finalResult = {
        summary: `3-day ${dietType} meal plan focused on ${goal}`,
        days: [
          {
            day: 'Day 1',
            meals: {
              breakfast: [
                { name: dietType === 'Vegetarian' ? 'Oatmeal with banana' : 'Eggs & toast', serving: '1 bowl', calories: 350 }
              ],
              lunch: [
                { name: dietType === 'Vegetarian' ? 'Chickpea salad' : 'Grilled chicken salad', serving: '1 plate', calories: 450 }
              ],
              dinner: [
                { name: dietType === 'Vegetarian' ? 'Paneer stir-fry' : 'Grilled salmon with veggies', serving: '1 plate', calories: 550 }
              ],
              snacks: [
                { name: 'Greek yogurt or fruit', serving: '1 cup', calories: 150 }
              ]
            },
            totalCalories: 1500
          }
        ],
        notes: ['Adjust portions to meet your daily calorie needs.']
      };
    }

    // Optionally save to DB if requested
    let saved = null;
    if (saveToProfile && userEmail) {
      const mp = new MealPlan({ userEmail, goal, dietType, weightKg, heightCm, activityLevel, result: finalResult });
      saved = await mp.save();
    }

    res.json({ result: finalResult, saved });
  } catch (error) {
    console.error('Meal plan error:', error);
    res.status(500).json({ message: 'Failed to generate meal plan' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});