import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FallbackPage from './components/FallbackPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

// Lazy Load
const HeroSection = lazy(() => import('./components/HeroSection'));
const ProductsSection = lazy(() => import('./components/ProductsSection'));
const WhyUsSection = lazy(() => import('./components/WhyUsSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const FaqSection = lazy(() => import('./components/FaqSection'));

const TrainersPage = lazy(() => import('./pages/TrainersPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const VideoCallPage = lazy(() => import('./pages/VideoCallPage'));
const FitnessPlannerPage = lazy(() => import('./pages/FitnessPlannerPage'));
const WorkoutPlannerPage = lazy(() => import('./pages/WorkoutPlannerPage'));
const WorkoutSessionPage = lazy(() => import('./pages/WorkoutSessionPage'));
const MealPlannerPage = lazy(() => import('./pages/MealPlannerPage'));
const PoseCorrectionPage = lazy(() => import('./pages/PoseCorrectionPage'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#178582]"></div>
  </div>
);

function HomePage() {
  return (
    <main className="w-full">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
        <ProductsSection />
        <WhyUsSection />
        <FaqSection />
        <ContactSection />
      </Suspense>
    </main>
  );
}


// Single SignedOut Redirect
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <div className="flex-grow w-full">
        <ErrorBoundary>
          {/* One master suspense layer */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes location={location}>
              
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/video-call/:sessionId" element={<VideoCallPage />} />

              {/* Private Routes */}
              <Route path="/booking/:trainerId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              <Route path="/fitness-planner" element={<ProtectedRoute><FitnessPlannerPage /></ProtectedRoute>} />
              <Route path="/workout-planner" element={<ProtectedRoute><WorkoutPlannerPage /></ProtectedRoute>} />
              <Route path="/meal-planner" element={<ProtectedRoute><MealPlannerPage /></ProtectedRoute>} />
              <Route path="/workout-session/:planId" element={<ProtectedRoute><WorkoutSessionPage /></ProtectedRoute>} />
              <Route path="/pose-correction/:exerciseName" element={<ProtectedRoute><PoseCorrectionPage /></ProtectedRoute>} />

              {/* Catch-all 404 */}
              <Route path="*" element={<FallbackPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
    }
