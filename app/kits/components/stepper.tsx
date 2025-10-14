import { Check } from "lucide-react";
import React from "react";

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="mb-8 flex items-start justify-between">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center w-[120px]">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                i < currentStep
                  ? "bg-green-500 text-white"
                  : i === currentStep
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i < currentStep ? <Check size={22} /> : i + 1}
            </div>
            <div className="text-center mt-3">
              <p
                className={`text-sm font-semibold ${
                  i === currentStep ? "text-slate-800" : "text-slate-500"
                }`}
              >
                {step.title}
              </p>
              <p
                className={`text-xs mt-1 ${
                  i === currentStep ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center w-[calc(100%/3-160px)] mt-6">
              <div
                className={`h-0.5 w-full ${
                  i < currentStep ? "bg-green-500" : "bg-slate-300"
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
