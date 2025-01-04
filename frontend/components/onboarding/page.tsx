import React from "react";
import AuroraBackground from "@/components/AuroraBackground";
import OnboardingForm from "./OnboardingForm";
import { BuildingIcon } from "lucide-react";

const OnboardingPage: React.FC = () => {
  return (
    <AuroraBackground>
      <section className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-8 glass dark:glass-dark p-8 rounded-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-fuchsia-100 flex items-center justify-center">
              <BuildingIcon className="h-6 w-6 text-fuchsia-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Set up your agency
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Let&apos;s get your agency set up so you can start using our
              platform
            </p>
          </div>
          <OnboardingForm />
        </div>
      </section>
    </AuroraBackground>
  );
};

export default OnboardingPage;
