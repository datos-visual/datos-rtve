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

  // Debug: Log state changes
  useEffect(() => {
    console.log("🔢 currentStep changed to:", currentStep);
    if (currentStep === 2) {
      console.log("🎬 Should show Screen3 now!");
    }
  }, [currentStep]);

  useEffect(() => {
    console.log("🏷️ selectedCategory changed to:", selectedCategory);
  }, [selectedCategory]);

  // Maneja la navegación desde los screens
  const handleNavigation = (event) => {
    console.log("📨 IntroUnified received event:", event);
    const { action, data } = event;

    switch (action) {
      case "next-screen":
        console.log("⬇️ Scrolling to screen2");
        if (currentStep === 1) {
          screen2Ref.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;

      case "category-selected":
        console.log(
          "🚀 IntroUnified received category-selected:",
          data?.category
        );
        console.log("🔄 Changing from step", currentStep, "to step 2");
        setSelectedCategory(data?.category);
        setCurrentStep(2);
        break;

      case "go-to-historias":
        console.log(
          "🌐 Navigating to historias with categoria:",
          data?.categoria
        );
        const target = data?.categoria
          ? `/historias?categoria=${encodeURIComponent(data.categoria)}`
          : "/historias";
        window.location.href = target;
        break;

      default:
        console.log("❓ Unknown action:", action);
        break;
    }
  };

  console.log(
    "🎨 Rendering IntroUnified with currentStep:",
    currentStep,
    "selectedCategory:",
    selectedCategory
  );

  return (
    <div className="intro-unified">
      {/* Screen 1 - visible en step 1 */}
      {currentStep === 1 && (
        <div ref={screen1Ref}>
          {console.log("🖥️ Rendering Screen1")}
          <IntroScreen1 onNavigation={handleNavigation} />
        </div>
      )}

      {/* Screen 2 - visible en step 1 */}
      {currentStep === 1 && (
        <div ref={screen2Ref}>
          {console.log("🖥️ Rendering Screen2")}
          <IntroScreen2 onNavigation={handleNavigation} />
        </div>
      )}

      {/* Screen 3 - visible en step 2 */}
      {currentStep === 2 && (
        <div ref={screen3Ref}>
          {console.log(
            "🖥️ Rendering Screen3 with categoria:",
            selectedCategory
          )}
          <IntroScreen3
            categoria={selectedCategory}
            onNavigation={handleNavigation}
          />
        </div>
      )}
    </div>
  );
}
