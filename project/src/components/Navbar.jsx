import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleNavClick = (sectionId) => {
    navigate('/', { replace: false });
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100); // Wait for navigation
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <span className="text-xl font-bold text-[#E7473C]">FitBro</span>
          </div>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => handleNavClick('home')} className="text-gray-700 hover:text-[#E7473C] px-2 py-1 text-sm font-medium">Home</button>
            <button onClick={() => handleNavClick('products')} className="text-gray-700 hover:text-[#E7473C] px-2 py-1 text-sm font-medium">Our Products</button>
            <button onClick={() => handleNavClick('why-us')} className="text-gray-700 hover:text-[#E7473C] px-2 py-1 text-sm font-medium">Why Us</button>
            <button onClick={() => handleNavClick('contact')} className="text-gray-700 hover:text-[#E7473C] px-2 py-1 text-sm font-medium">Contact Us</button>
            {!isSignedIn ? (
              <SignInButton>
                <button className="bg-[#E7473C] hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Log in
                </button>
              </SignInButton>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#E7473C] focus:outline-none">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNavClick('home')} className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">Home</button>
            <button onClick={() => handleNavClick('products')} className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">Our Products</button>
            <button onClick={() => handleNavClick('why-us')} className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">Why Us</button>
            <button onClick={() => handleNavClick('contact')} className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">Contact Us</button>
            <div className="w-full mt-2">
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#E7473C] hover:bg-red-600 text-white px-4 py-2 rounded-md text-base font-medium">
                    Log in
                  </button>
                </SignInButton>
              ) : (
                <div className="flex justify-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;