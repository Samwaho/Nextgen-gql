'use client';

import Link from "next/link";
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/graphql/auth';
import { Sparkles } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import ProfileMenu from '@/components/ProfileMenu';

export default function Home() {
  const { data } = useQuery(GET_CURRENT_USER);
  const isLoggedIn = !!data?.currentUser;

  return (
    <div className="grid min-h-screen p-4 pb-16 gap-8 sm:p-8 md:p-12 lg:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 flex items-center gap-2 sm:gap-4">
        <Link
          href="/services"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden sm:inline">Services</span>
        </Link>
        <ModeToggle />
        {isLoggedIn ? (
          <ProfileMenu user={data.currentUser} />
        ) : (
          <Link 
            href="/sign-in" 
            className="px-6 py-2 rounded-full border border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>

      <main className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8">
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-custom bg-clip-text text-transparent">
            NetGN
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline Your ISP Operations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 w-full px-4 sm:px-0 max-w-7xl">
          <Link href="/services" className="group">
            <div className="p-6 rounded-lg border glass-card group-hover:border-foreground/20 transition-colors">
              <h2 className="text-xl font-semibold mb-2 bg-gradient-custom bg-clip-text text-transparent">Internet Services</h2>
              <p className="text-muted-foreground">Explore our range of high-speed internet plans and service tiers.</p>
            </div>
          </Link>
          
          <div className="p-6 rounded-lg border glass-card">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-custom bg-clip-text text-transparent">Network Monitoring</h2>
            <p className="text-muted-foreground">Real-time monitoring of network stations and performance metrics.</p>
          </div>
          
          <div className="p-6 rounded-lg border glass-card">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-custom bg-clip-text text-transparent">Billing & Transactions</h2>
            <p className="text-muted-foreground">Streamlined billing processes and transaction management.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link 
            href="/isp-manager" 
            className="rounded-full bg-gradient-custom text-white px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link 
            href="/services" 
            className="rounded-full border border-foreground/10 px-6 py-3 font-medium hover:bg-foreground/5 transition-colors text-foreground"
          >
            View Services
          </Link>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground bg-background/50 backdrop-blur-sm">
        <p> {new Date().getFullYear()} NetGN. All rights reserved.</p>
      </footer>
    </div>
  );
}
