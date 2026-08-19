import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimatedSectionProps {
  children: ReactNode;
  animationType?: "fadeUp" | "slideLeft" | "slideRight" | "zoom";
  delay?: number;
  className?: string;
}

const AnimatedSection = ({ 
  children, 
  animationType = "fadeUp",
  delay = 0,
  className = "" 
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  const animationClasses = {
    fadeUp: "animate-scroll-fade",
    slideLeft: "animate-scroll-slide-left",
    slideRight: "animate-scroll-slide-right",
    zoom: "animate-scroll-zoom",
  };

  return (
    <div
      ref={ref}
      className={`${animationClasses[animationType]} ${isVisible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;

