"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface UserData {
  name: string;
  age: string;
  weight: string;
  sex: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    age: "",
    weight: "",
    sex: "",
  });

  useEffect(() => {
    async function getUser() {
      try {
        setIsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);

        // Get user profile data from database
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user data:", error);
        }

        if (data) {
          setUserData({
            name: data.name || "",
            age: data.age?.toString() || "",
            weight: data.weight?.toString() || "",
            sex: data.sex || "",
          });
        }
      } catch (error) {
        console.error("Error in profile page:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getUser();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
    setIsSaved(false);
  };

  const handleSexChange = (value: string) => {
    setUserData((prev) => ({
      ...prev,
      sex: value,
    }));
    setIsDirty(true);
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    try {
      setIsSaving(true);

      const updatedData = {
        id: user.id,
        name: userData.name,
        age: userData.age ? parseInt(userData.age, 10) : null,
        weight: userData.weight ? parseFloat(userData.weight) : null,
        sex: userData.sex || null,
      };

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      let error;

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from("users")
          .update(updatedData)
          .eq("id", user.id);

        error = updateError;
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from("users")
          .insert(updatedData);

        error = insertError;
      }

      if (error) {
        console.error("Error saving user data:", error);
        return;
      }

      // Set saved status and remove dirty flag
      setIsSaved(true);
      setIsDirty(false);
    } catch (error) {
      console.error("Error in profile update:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            View and edit your personal information
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={userData.age}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                value={userData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={userData.sex} onValueChange={handleSexChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <Button type="submit" disabled={isSaving || (!isDirty && isSaved)}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            {isSaved && !isDirty && (
              <div className="flex items-center text-green-600 dark:text-green-500">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Saved</span>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
