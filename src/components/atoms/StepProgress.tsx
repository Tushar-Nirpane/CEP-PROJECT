import React from 'react';
import { Check, Scan, Search, ClipboardCheck, ShieldCheck } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
  onSelectStep?: (step: number) => void;
}

const STEPS = [
  { id: 1, label: 'Document OCR', icon: Scan },
  { id: 2, label: 'Legacy Match', icon: Search },
  { id: 3, label: 'Rule Engine', icon: ClipboardCheck },
  { id: 4, label: 'Crypto Seal', icon: ShieldCheck },
];

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  onSelectStep,
}) => {
  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <button
                onClick={() => isCompleted && onSelectStep?.(step.id)}
                disabled={!isCompleted && !isCurrent}
                className={`group flex flex-col items-center gap-1.5 focus:outline-none transition-all ${
                  isCompleted ? 'cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#0C3B5D] border-[#0C3B5D] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#AC6953] border-[#AC6953] text-white ring-4 ring-[#AC6953]/20 shadow-md scale-105'
                      : 'bg-white border-[#BEC3C8] text-[#BEC3C8]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] md:text-xs font-bold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-[#AC6953]'
                      : isCompleted
                      ? 'text-[#0C3B5D]'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 -mt-5 bg-[#BEC3C8]/50 relative overflow-hidden rounded">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentStep > step.id
                        ? 'bg-[#0C3B5D] w-full'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
