import { useMediaQuery } from "./useMediaQuery"

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled reduced motion in their system settings
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

/**
 * Hook to get animation duration based on user preference
 * Returns 0 if user prefers reduced motion, otherwise returns the provided duration
 */
export function useAnimationDuration(defaultDuration: number): number {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ? 0 : defaultDuration
}

/**
 * Get animation props for framer-motion based on user preference
 */
export function useMotionPreference() {
  const prefersReducedMotion = useReducedMotion()

  return {
    // Skip animations entirely if reduced motion is preferred
    skipAnimation: prefersReducedMotion,

    // Use for transition durations
    duration: prefersReducedMotion ? 0 : undefined,

    // Animation variants that respect reduced motion
    variants: {
      initial: prefersReducedMotion ? {} : { opacity: 0, y: 10 },
      animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
      exit: prefersReducedMotion ? {} : { opacity: 0, y: -10 },
    },

    // Transition settings
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { type: "spring", stiffness: 300, damping: 30 },
  }
}
