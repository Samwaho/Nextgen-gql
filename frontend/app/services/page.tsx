"use client";

import { useQuery } from "@apollo/client";
import { GET_SERVICES, Service } from "@/graphql/services";
import { useSubscription } from "@/graphql/subscriptions";
import { GET_CURRENT_USER } from '@/graphql/auth';
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";

export default function ServicesPage() {
  const { data, loading, error } = useQuery<{ services: Service[] }>(GET_SERVICES);
  const { data: userData } = useQuery(GET_CURRENT_USER);
  const { createSubscription, isCreating } = useSubscription();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const isLoggedIn = !!userData?.currentUser;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading services: {error.message}
      </div>
    );
  }

  const handleSubscribe = async () => {
    if (!selectedService) return;
    
    try {
      await createSubscription({
        service_id: selectedService.id,
        tier_name: selectedTier,
      });
      toast.success("Successfully subscribed to the service!");
      setSelectedService(null);
      setSelectedTier("");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Error: " + error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="grid min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <ModeToggle />
        {isLoggedIn ? (
          <Link 
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 transition-all"
          >
            <UserCircle className="w-5 h-5" />
            <span className="hidden sm:inline">{userData.currentUser.name}</span>
          </Link>
        ) : (
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full border border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>

      <main className="flex flex-col items-center justify-center gap-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-custom bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-8">
          {data?.services.map((service) => (
            <Card key={service.id} className="flex flex-col glass-card border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold bg-gradient-custom bg-clip-text text-transparent">
                  {service.name}
                </CardTitle>
                <CardDescription>
                  Choose from {service.tiers.length} available tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  {service.tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="border rounded-lg p-4 space-y-2 bg-background/50"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{tier.name}</h3>
                        <span className="text-lg font-bold bg-gradient-custom bg-clip-text text-transparent">
                          KSh {tier.price.toLocaleString()}
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {tier.features.map((feature) => (
                          <li key={feature} className="text-sm text-muted-foreground">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Dialog modal={true}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-custom hover:opacity-90 transition-opacity text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      Subscribe
                    </Button>
                  </DialogTrigger>
                  <DialogPortal>
                    <DialogContent 
                      className="glass-card !fixed !top-[50%] !left-[50%] !-translate-x-[50%] !-translate-y-[50%] z-50"
                      onPointerDownOutside={(e) => e.preventDefault()}
                      onInteractOutside={(e) => e.preventDefault()}
                    >
                      <DialogHeader>
                        <DialogTitle>Choose a Tier</DialogTitle>
                        <DialogDescription>
                          Select a tier for {selectedService?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <RadioGroup
                        value={selectedTier}
                        onValueChange={setSelectedTier}
                        className="space-y-4"
                      >
                        {selectedService?.tiers.map((tier) => (
                          <div
                            key={tier.name}
                            className="flex items-center space-x-2 border rounded-lg p-4 bg-background/50"
                          >
                            <RadioGroupItem value={tier.name} id={tier.name} />
                            <Label htmlFor={tier.name} className="flex-grow">
                              <div className="flex justify-between items-center">
                                <span>{tier.name}</span>
                                <span className="font-bold bg-gradient-custom bg-clip-text text-transparent">
                                  KSh {tier.price.toLocaleString()}
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <DialogFooter>
                        <Button
                          onClick={handleSubscribe}
                          disabled={!selectedTier || isCreating}
                          className="bg-gradient-custom hover:opacity-90 transition-opacity"
                        >
                          {isCreating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Confirm Subscription
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground bg-background/50 backdrop-blur-sm">
        <p> {new Date().getFullYear()} NextGN. All rights reserved.</p>
      </footer>
    </div>
  );
}
