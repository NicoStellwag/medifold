import MobileLayout from "@/components/mobile-layout";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SettingsForm } from "@/components/settings-form";

// This is the Server Component wrapper for the settings page.
// It fetches the user data server-side and passes it to the layout.
export default async function SettingsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <MobileLayout user={user}>
      <SettingsForm />
    </MobileLayout>
  );
}
