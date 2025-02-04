"use client";

import { useQuery } from "@apollo/client";
import { GET_AGENCIES } from "@/graphql/agency";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AgencyPage() {
  const { data, loading, error } = useQuery(GET_AGENCIES);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] bg-background/50">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-fuchsia-100/20 shadow-sm">
            <CardHeader className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background/50">
        <Alert variant="destructive" className="max-w-xl w-full animate-in fade-in-50 duration-300">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold tracking-tight">Error Loading Agency</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            We encountered an issue while loading your agency information. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasAgency = data?.agencies?.length > 0;

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] bg-background/50 rounded-lg">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {hasAgency ? "Manage Your Agency" : "Welcome to Agency Setup"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {hasAgency 
              ? "Update your agency information and settings below"
              : "Get started by creating your agency profile"}
          </p>
        </div>
        
        <Card className="border border-fuchsia-100/20 shadow-sm animate-in fade-in-50 duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/10 to-transparent pointer-events-none" />
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              {hasAgency ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-fuchsia-500"
                  >
                    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                    <path d="M3 7h18" />
                    <path d="M8 21h8" />
                    <path d="M7 10.5v3" />
                    <path d="M12 10.5v3" />
                    <path d="M17 10.5v3" />
                  </svg>
                  <span>Agency Information</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-fuchsia-500"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  <span>Create Your Agency</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingForm initialData={data?.agencies?.[0]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
