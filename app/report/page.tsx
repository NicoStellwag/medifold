"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import MobileLayout from "@/components/mobile-layout";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface HealthTips {
  statusQuo: string;
  painPoints: { point: string; reason: string }[];
  dietTips: { tip: string; reason: string }[];
  habitTips: { tip: string; reason: string }[];
  supplementProposals: { supplement: string; reason: string }[];
  fitnessTips: { tip: string; reason: string }[];
  shoppingList: { item: string; reason: string }[];
}

export default function ReportPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [tipsData, setTipsData] = useState<HealthTips | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
    };
    getUserData();
  }, [supabase]);

  useEffect(() => {
    const fetchTips = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/generate-tips");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const data: HealthTips = await response.json();
        setTipsData(data);
      } catch (err: any) {
        console.error("Failed to fetch tips:", err);
        setError(
          err.message || "An unknown error occurred while fetching tips."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, []);

  const renderTipList = (
    items: {
      tip?: string;
      supplement?: string;
      item?: string;
      reason: string;
    }[],
    title: string,
    keyPrefix: string
  ) => (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="list-disc space-y-3 pl-5">
            {items.map((item, index) => (
              <li key={`${keyPrefix}-${index}`}>
                <span className="font-medium">
                  {item.tip || item.supplement || item.item}:
                </span>
                <span className="block text-sm text-muted-foreground">
                  Reason: {item.reason}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderPainPointsList = (
    items: { point: string; reason: string }[],
    title: string,
    keyPrefix: string
  ) => (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="list-disc space-y-3 pl-5">
            {items.map((item, index) => (
              <li key={`${keyPrefix}-${index}`}>
                <span className="font-medium">{item.point}:</span>
                <span className="block text-sm text-muted-foreground">
                  Reason: {item.reason}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} identified.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderLoadingSkeletons = () => (
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <Card
          key={`skeleton-card-${i}`}
          className="bg-card border-border shadow-md"
        >
          <CardHeader>
            <Skeleton className="h-6 w-1/2 rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <MobileLayout user={user}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Health Report & Tips</h1>

        {isLoading && renderLoadingSkeletons()}

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Tips</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && tipsData && (
          <div className="space-y-6">
            {/* Status Quo Section */}
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle>Status Quo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{tipsData.statusQuo}</p>
              </CardContent>
            </Card>

            {/* Pain Points Section */}
            {renderPainPointsList(
              tipsData.painPoints,
              "Identified Pain Points",
              "painpoint"
            )}

            {renderTipList(
              tipsData.habitTips,
              "Habit / Lifestyle Tips",
              "habit"
            )}

            {/* Fitness Tips Section */}
            {renderTipList(
              tipsData.fitnessTips,
              "Fitness / Exercise Tips",
              "fitness"
            )}

            {renderTipList(tipsData.dietTips, "Diet Tips", "diet")}
            {renderTipList(
              tipsData.supplementProposals,
              "Supplement Proposals",
              "supplement"
            )}
            {renderTipList(tipsData.shoppingList, "Shopping List", "shopping")}
          </div>
        )}

        {!isLoading && !error && !tipsData && (
          <p className="text-center text-muted-foreground">
            No tips data available.
          </p>
        )}

        {/* TODO: Add sections for detailed data visualization */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Charts and summaries of your health data will appear here.</p>
          </CardContent>
        </Card> */}
      </div>
    </MobileLayout>
  );
}
