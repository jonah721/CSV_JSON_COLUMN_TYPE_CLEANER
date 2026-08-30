import React from 'react';
import { Step } from '../types/schema';

interface StepperNavProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
  canNavigateToStep?: (step: Step) => boolean;
}

const STEPS: { id: Step; label: string; number: number }[] = [
  { id: 'upload', label: 'Upload', number: 1 },
  { id: 'schema', label: 'Schema', number: 2 },
  { id: 'review', label: 'Review', number: 3 },
  { id: 'validate', label: 'Validate', number: 4 },
  { id: 'export', label: 'Export', number: 5 },
];

export const StepperNav: React.FC<StepperNavProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep,
}) => {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-[#F7F6F3] border-b border-[#D8D5CE] py-3.5 px-3 sm:px-6 mb-8">
      <div className="max-w-[1312px] mx-auto flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;
          const isClickable = canNavigateToStep ? canNavigateToStep(step.id) : isCompleted;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div
                id={`step-nav-${step.id}`}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.id);
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2.5 select-none shrink-0 ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={`${step.number}. ${step.label}`}
              >
                {/* Step Circle */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[12px] sm:text-[13px] font-bold transition-colors shrink-0 ${
                    isCompleted
                      ? 'bg-[#3C7A5F] text-white'
                      : isActive
                      ? 'bg-[#2E4057] text-white'
                      : 'bg-[#F7F6F3] border border-[#B9B6AC] text-[#6B6E73]'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.5]"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Step Label: Always visible on desktop (md+); on mobile shows active step label so all 5 steps fit without clipping */}
                <span
                  className={`text-[12px] sm:text-[14px] whitespace-nowrap ${
                    isActive
                      ? 'text-[#2E4057] font-bold inline'
                      : isCompleted
                      ? 'text-[#3C7A5F] font-semibold hidden md:inline'
                      : 'text-[#6B6E73] font-normal hidden md:inline'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 min-w-[8px] h-[1.5px] mx-1 sm:mx-2.5 md:mx-3 transition-colors ${
                    index < currentStepIndex
                      ? 'bg-[#3C7A5F]'
                      : 'bg-[#D8D5CE]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
