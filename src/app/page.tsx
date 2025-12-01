'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, Home as HomeIcon, BarChart3, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <main className="flex flex-col items-center justify-center gap-8 px-4 pt-32 pb-16">
          {/* Animated Icon Section */}
          <div
            className={`flex items-center gap-3 text-primary transition-all duration-700 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
              <HomeIcon className="h-12 w-12 relative" />
            </div>
            <TrendingUp className="h-12 w-12 animate-bounce" style={{ animationDelay: "0.1s" }} />
          </div>

          {/* Animated Title Section */}
          <div
            className={`max-w-2xl space-y-4 transition-all duration-700 delay-100 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
              Real Estate Analysis <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Platform</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Get instant insights and trends for real estate locations using our AI-powered chatbot. Make data-driven decisions with confidence.
            </p>
          </div>

          {/* CTA Button Section */}
          <div
            className={`flex flex-col sm:flex-row gap-4 mt-8 transition-all duration-700 delay-200 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link href="/real-estate-chatbot">
              <Button size="lg" className="gap-2 group hover:shadow-lg transition-all hover:-translate-y-1">
                <Zap className="h-5 w-5 group-hover:animate-spin" />
                Launch Chatbot
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 hover:shadow-lg transition-all hover:-translate-y-1">
              <BarChart3 className="h-5 w-5" />
              Learn More
            </Button>
          </div>

          {/* Features Grid with Staggered Animation */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
            {[
              {
                title: "Location Analysis",
                description: "Get detailed analysis for any real estate location",
                icon: HomeIcon,
                delay: 300,
              },
              {
                title: "Demand Trends",
                description: "Visualize price and demand trends over time",
                icon: TrendingUp,
                delay: 400,
              },
              {
                title: "Data Tables",
                description: "View comprehensive data in easy-to-read tables",
                icon: BarChart3,
                delay: 500,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 cursor-pointer transition-all ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: isLoaded ? `${feature.delay}ms` : "0ms" }}
                >
                  <div className="mb-3 inline-flex p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div
            className={`mt-20 grid grid-cols-3 gap-8 max-w-2xl w-full text-center transition-all duration-700 delay-600 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Locations Analyzed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Data Points</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground mt-1">Accuracy Rate</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}