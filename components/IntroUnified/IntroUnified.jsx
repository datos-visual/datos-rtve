"use client";

import { useRef, useState, useEffect } from "react";
import IntroScreen1 from "../intro/introScreen1";
import IntroScreen2 from "../intro/introScreen2";
import IntroScreen3 from "../intro/introScreen3";
import "../../app/styles/_introUnified.scss";

export default function HomePage() {
  const screen1Ref = useRef(null);
  const screen2Ref = useRef(null);
  const screen3Ref = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Maneja la navegación desde los screens
  const handleNavigation = (event) => {
    const { action, data } = event;

    switch (action) {
      case "next-screen":
        if (currentStep === 1) {
          screen2Ref.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;

      case "category-selected":
        setSelectedCategory(data?.category);
        setCurrentStep(2);
        break;

      case "go-to-historias":
        const target = data?.categoria
          ? `/historias?categoria=${encodeURIComponent(data.categoria)}`
          : "/historias";
        window.location.href = target;
        break;

      default:
        break;
    }
  };

  return (
    <div className="intro-unified">
      {/* Screen 1 - visible en step 1 */}
      {currentStep === 1 && (
        <div ref={screen1Ref}>
          <IntroScreen1 onNavigation={handleNavigation} />
        </div>
      )}

      {/* Screen 2 - visible en step 1 */}
      {currentStep === 1 && (
        <div ref={screen2Ref}>
          <IntroScreen2 onNavigation={handleNavigation} />
        </div>
      )}

      {/* Screen 3 - visible en step 2 */}
      {currentStep === 2 && (
        <div ref={screen3Ref}>
          <IntroScreen3
            categoria={selectedCategory}
            onNavigation={handleNavigation}
          />
        </div>
      )}
    </div>
  );
}
