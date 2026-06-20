import { Spinner } from "@/components/ui/spinner";
import { useTravelAdvisor } from "@/features/travel-advisor/hooks/use-travel-advisor";
import { OnboardingWizard } from "./onboarding-wizard";
import { RecommendationList } from "./recommendation-list";

export function TravelAdvisorPanel() {
  const {
    wizard,
    step,
    view,
    isSubmitting,
    submitError,
    recommendations,
    nextStep,
    prevStep,
    setRestStyle,
    toggleFavoritePlace,
    setVacationGoal,
    setTravelWith,
    isStepValid,
    submit,
    retake,
  } = useTravelAdvisor();

  if (view === "loading") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <Spinner className="size-8" />
        <p className="text-sm font-medium text-foreground">
          Analyzing your preferences...
        </p>
        <p className="text-xs text-muted-foreground">
          Our AI is finding your perfect activities
        </p>
      </div>
    );
  }

  if (view === "results" && recommendations) {
    return <RecommendationList data={recommendations} onRetake={retake} />;
  }

  return (
    <OnboardingWizard
      wizard={wizard}
      step={step}
      isStepValid={isStepValid}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onNextStep={nextStep}
      onPrevStep={prevStep}
      onSetRestStyle={setRestStyle}
      onToggleFavoritePlace={toggleFavoritePlace}
      onSetVacationGoal={setVacationGoal}
      onSetTravelWith={setTravelWith}
      onSubmit={submit}
    />
  );
}
