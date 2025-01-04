import Header from "@/components/header/page";
import Sidebar from "@/components/sidebar/Sidebar";
import { redirect } from "next/navigation";
import React from "react";
import OnboardingPage from "@/components/onboarding/page";
import { GET_CURRENT_USER } from "@/graphql/auth";
import { getClient } from "@/lib/apollo-client";
import { cookies } from "next/headers";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  agency?: {
    id: string;
    name: string;
  };
}

type Props = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

const Layout = async ({ children }: Props) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const client = getClient(token);

    const { data } = await client.query({
      query: GET_CURRENT_USER,
    });

    const loggedInUser = data?.currentUser as AuthUser | null;

    if (!loggedInUser) {
      return redirect("/sign-in");
    }

    if (!loggedInUser.name) {
      return redirect("/sign-in");
    }

    if (loggedInUser?.agency) {
      return (
        <div className="min-h-screen flex flex-col lg:flex-row lg:gap-4 lg:p-4">
          <aside className="w-full lg:w-[18%] xl:w-[14%] lg:fixed lg:top-4 lg:left-4 lg:h-[calc(100vh-2rem)]">
            <Sidebar loggedInUser={loggedInUser} />
          </aside>
          <main className="w-full lg:w-[82%] xl:w-[86%] lg:ml-auto overflow-y-auto">
            <div className="p-4 ">
              <Header loggedInUser={loggedInUser} />
              <div className="mt-4">{children}</div>
            </div>
          </main>
        </div>
      );
    } else {
      return <OnboardingPage />;
    }
  } catch (error) {
    console.error("Layout error:", error);
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return redirect("/sign-in");
  }
};

export default Layout;
