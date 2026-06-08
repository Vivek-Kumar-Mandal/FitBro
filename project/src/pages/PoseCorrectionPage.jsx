import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPoseCorrectionUrl, hasPoseCorrectionUrl } from "../config/poseCorrectionUrls";

const PoseCorrectionPage = () => {
  const { exerciseName } = useParams();
  const navigate = useNavigate();
  
  // Decode the exercise name from URL (in case it has spaces or special characters)
  const decodedExerciseName = exerciseName ? decodeURIComponent(exerciseName) : null;
  const poseCorrectionUrl = decodedExerciseName ? getPoseCorrectionUrl(decodedExerciseName) : null;
  const hasUrl = decodedExerciseName ? hasPoseCorrectionUrl(decodedExerciseName) : false;

  if (!decodedExerciseName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-[#178582]">Exercise Not Specified</h1>
          <p className="mb-8 text-gray-700">Please select an exercise to view pose correction.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#178582] hover:bg-teal-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hasUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-[#178582]">{decodedExerciseName}</h1>
          <p className="mb-8 text-gray-700">Pose correction URL not configured for this exercise yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#178582] hover:bg-teal-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#178582]">{decodedExerciseName} Form Analyzer</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>
        <p className="mb-8 text-gray-700 max-w-xl text-center mx-auto">
          Upload a video of your {decodedExerciseName.toLowerCase()} and get instant feedback on your form!
        </p>
        <div className="w-full h-[900px] shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white">
          <iframe
            src={poseCorrectionUrl}
            title={`${decodedExerciseName} Form Analyzer`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="camera; microphone"
            style={{ minHeight: 900, width: "100%", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PoseCorrectionPage;