/**
 * EXAMPLE: Profile Page with Notification Settings
 *
 * This shows how to integrate the NotificationSettings component
 * into your profile page (or settings page).
 *
 * Copy the relevant parts into your existing profile page.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NotificationSettings } from "@/components/notification-settings";

export default async function ProfilePage() {
  // 1. Get the current user session
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Fetch the user's current notification settings
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailNotificationsEnabled: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="space-y-6">
        {/* Other profile sections can go here */}
        {/* For example: Account info, password change, etc. */}

        {/* Notification Settings */}
        <NotificationSettings
          initialEmailNotificationsEnabled={user.emailNotificationsEnabled}
        />

        {/* Add other settings cards here */}
      </div>
    </div>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the NotificationSettings component:
 *    import { NotificationSettings } from "@/components/notification-settings";
 *
 * 2. Fetch the user's emailNotificationsEnabled value from the database
 *
 * 3. Pass it as a prop to NotificationSettings:
 *    <NotificationSettings
 *      initialEmailNotificationsEnabled={user.emailNotificationsEnabled}
 *    />
 *
 * 4. The component will handle the rest (toggle UI, API calls, etc.)
 */
