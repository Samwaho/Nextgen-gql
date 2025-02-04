"use client";

import { Building } from "lucide-react";
import { formatDate } from "@/lib/utils";
import StationForm from "../StationForm";
import { useQuery } from "@apollo/client";
import { GET_STATION, Station } from "@/graphql/station";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const { data, loading } = useQuery(GET_STATION, {
    variables: { id },
  });
  const station: Station = data?.station;

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-gray-500">page/ </span>
            <Skeleton className="h-6 w-32 inline-block" />
          </h1>
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="mt-6">
          <div className="bg-card_light dark:bg-card_dark rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ))}
              <div className="flex justify-center">
                <Skeleton className="h-10 w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-gray-500">page/ </span>
            Station Not Found
          </h1>
          <p className="text-sm text-gray-500">{formatDate()}</p>
        </div>

        <div className="mt-6">
          <div className="bg-card_light dark:bg-card_dark rounded-xl shadow-md p-6">
            <p className="text-center text-gray-500">
              The requested station could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Edit Station
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="mt-6">
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-md shadow-md text-white bg-gradient-custom2">
              <Building className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">Edit Station: {station.name}</h2>
          </div>
          <StationForm station={station} isEditing />
        </div>
      </div>
    </div>
  );
}
