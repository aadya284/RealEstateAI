import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, Home as HomeIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <main className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="flex items-center gap-3 text-primary">
          <HomeIcon className="h-12 w-12" />
          <TrendingUp className="h-12 w-12" />
        </div>
        
        <div className="max-w-2xl space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Real Estate Analysis Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Get instant insights and trends for real estate locations using our AI-powered chatbot
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/real-estate-chatbot">
            <Button size="lg" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Open Chatbot
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Location Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed analysis for any real estate location
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Demand Trends</h3>
            <p className="text-sm text-muted-foreground">
              Visualize price and demand trends over time
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Data Tables</h3>
            <p className="text-sm text-muted-foreground">
              View comprehensive data in easy-to-read tables
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}