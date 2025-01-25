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
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load agency information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasAgency = data?.agencies?.length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {hasAgency ? "Agency Information" : "Create Your Agency"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm initialData={data?.agencies?.[0]} />
        </CardContent>
      </Card>
    </div>
  );
}
