import Link from "next/link";

export default function Home() {
  return (
    <div className="grid min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center justify-center gap-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-custom bg-clip-text text-transparent">
            NextGN
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline Your ISP Operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-8">
          <div className="p-6 rounded-lg border glass-card">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-custom bg-clip-text text-transparent">Customer Management</h2>
            <p className="text-muted-foreground">Efficiently manage customer accounts, subscriptions, and service requests.</p>
          </div>
          
          <div className="p-6 rounded-lg border glass-card">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-custom bg-clip-text text-transparent">Network Monitoring</h2>
            <p className="text-muted-foreground">Real-time monitoring of network stations and performance metrics.</p>
          </div>
          
          <div className="p-6 rounded-lg border glass-card">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-custom bg-clip-text text-transparent">Billing & Transactions</h2>
            <p className="text-muted-foreground">Streamlined billing processes and transaction management.</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link 
            href="/main" 
            className="rounded-full bg-gradient-custom text-white px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link 
            href="/about" 
            className="rounded-full border border-foreground/10 px-6 py-3 font-medium hover:bg-foreground/5 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground bg-background/50 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} NextGN. All rights reserved.</p>
      </footer>
    </div>
  );
}
