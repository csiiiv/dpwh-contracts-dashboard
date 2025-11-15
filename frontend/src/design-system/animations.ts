// Animation keyframes and utilities
export const keyframes = {
  // Loading animations
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
  `,
  
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  
  slideInFromTop: `
    @keyframes slideInFromTop {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  slideInFromBottom: `
    @keyframes slideInFromBottom {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  slideInFromLeft: `
    @keyframes slideInFromLeft {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  
  slideInFromRight: `
    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  
  scaleOut: `
    @keyframes scaleOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.9);
        opacity: 0;
      }
    }
  `,
  
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
  `,
  
  wiggle: `
    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
  `,
  
  heartbeat: `
    @keyframes heartbeat {
      0% { transform: scale(1); }
      14% { transform: scale(1.3); }
      28% { transform: scale(1); }
      42% { transform: scale(1.3); }
      70% { transform: scale(1); }
    }
  `,
}

// Animation utilities
export const animations = {
  // Duration presets
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
    easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
    easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
    easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
    easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
    easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
    easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
    easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)',
    easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common animation combinations
  presets: {
    fadeIn: {
      animation: 'fadeIn',
      duration: '300ms',
      easing: 'ease-out',
    },
    fadeOut: {
      animation: 'fadeOut',
      duration: '200ms',
      easing: 'ease-in',
    },
    slideInFromTop: {
      animation: 'slideInFromTop',
      duration: '300ms',
      easing: 'ease-out',
    },
    slideInFromBottom: {
      animation: 'slideInFromBottom',
      duration: '300ms',
      easing: 'ease-out',
    },
    slideInFromLeft: {
      animation: 'slideInFromLeft',
      duration: '300ms',
      easing: 'ease-out',
    },
    slideInFromRight: {
      animation: 'slideInFromRight',
      duration: '300ms',
      easing: 'ease-out',
    },
    scaleIn: {
      animation: 'scaleIn',
      duration: '200ms',
      easing: 'ease-out',
    },
    scaleOut: {
      animation: 'scaleOut',
      duration: '150ms',
      easing: 'ease-in',
    },
    spin: {
      animation: 'spin',
      duration: '1000ms',
      easing: 'linear',
      iterationCount: 'infinite',
    },
    pulse: {
      animation: 'pulse',
      duration: '2000ms',
      easing: 'ease-in-out',
      iterationCount: 'infinite',
    },
    bounce: {
      animation: 'bounce',
      duration: '1000ms',
      easing: 'ease-in-out',
      iterationCount: 'infinite',
    },
    shake: {
      animation: 'shake',
      duration: '500ms',
      easing: 'ease-in-out',
    },
    wiggle: {
      animation: 'wiggle',
      duration: '1000ms',
      easing: 'ease-in-out',
      iterationCount: 'infinite',
    },
    heartbeat: {
      animation: 'heartbeat',
      duration: '1300ms',
      easing: 'ease-in-out',
      iterationCount: 'infinite',
    },
  },
}

// Animation helper functions
export const createAnimation = (
  name: string,
  duration: string = animations.duration.normal,
  easing: string = animations.easing.easeOut,
  iterationCount: string = '1',
  fillMode: string = 'both'
) => ({
  animationName: name,
  animationDuration: duration,
  animationTimingFunction: easing,
  animationIterationCount: iterationCount,
  animationFillMode: fillMode,
})

// Reduced motion support
export const respectsReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get animation with reduced motion support
export const getAnimation = (preset: keyof typeof animations.presets) => {
  if (respectsReducedMotion()) {
    return {
      animation: 'none',
      transition: 'none',
    }
  }
  
  return animations.presets[preset]
}
