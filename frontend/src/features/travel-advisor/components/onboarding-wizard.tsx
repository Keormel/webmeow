import { Button } from "@/components/ui/button";
import { StepRestStyle } from "./step-rest-style";
import { StepFavoritePlaces } from "./step-favorite-places";
import { StepVacationGoal } from "./step-vacation-goal";
import { StepTravelWith } from "./step-travel-with";
import type {
  FavoritePlace,
  RestStyle,
  TravelWith,
  VacationGoal,
  WizardState,
} from "@/features/travel-advisor/types";

const STEP_LABELS = [
  "Rest Style",
  "Favorite Places",
  "Vacation Goal",
  "Travel With",
];

interface OnboardingWizardProps {
  wizard: WizardState;
  step: number;
  isStepValid: (step: number) => boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetRestStyle: (v: RestStyle) => void;
  onToggleFavoritePlace: (p: FavoritePlace) => void;
  onSetVacationGoal: (v: VacationGoal) => void;
  onSetTravelWith: (v: TravelWith) => void;
  onSubmit: () => void;
}

export function OnboardingWizard({
  wizard,
  step,
  isStepValid,
  isSubmitting,
  submitError,
  onNextStep,
  onPrevStep,
  onSetRestStyle,
  onToggleFavoritePlace,
  onSetVacationGoal,
  onSetTravelWith,
  onSubmit,
}: OnboardingWizardProps) {
  const isLast = step === 3;

  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="mb-6 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`mt-1 text-center text-[10px] font-medium transition-colors ${
                i <= step ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {step === 0 && (
          <StepRestStyle value={wizard.restStyle} onChange={onSetRestStyle} />
        )}
        {step === 1 && (
          <StepFavoritePlaces
            value={wizard.favoritePlaces}
            onToggle={onToggleFavoritePlace}
          />
        )}
        {step === 2 && (
          <StepVacationGoal
            value={wizard.vacationGoal}
            onChange={onSetVacationGoal}
          />
        )}
        {step === 3 && (
          <StepTravelWith
            value={wizard.travelWith}
            onChange={onSetTravelWith}
          />
        )}
      </div>

      {/* Error */}
      {submitError && (
        <div className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevStep}
          disabled={step === 0 || isSubmitting}
        >
          Back
        </Button>
        <span className="text-xs text-muted-foreground">
          {step + 1} / {STEP_LABELS.length}
        </span>
        {isLast ? (
          <Button
            onClick={onSubmit}
            disabled={!isStepValid(step) || isSubmitting}
          >
            {isSubmitting ? "Analyzing..." : "Get Recommendations ✨"}
          </Button>
        ) : (
          <Button
            onClick={onNextStep}
            disabled={!isStepValid(step)}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
