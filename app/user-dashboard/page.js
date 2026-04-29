import UserDashboardClient from "@/components/dashboard/UserDashboardClient";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Dashboard | ShraddhaSetu"
};

export default async function UserDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/user-dashboard");
  }
  if (user.role !== "USER") {
    if (user.role === "ADMIN") {
      redirect("/admin-dashboard");
    }
    redirect("/pandits");
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>User Dashboard</h1>
          <p>My bookings, payment status, profile details and reschedule requests.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <UserDashboardClient />
        </div>
      </section>
    </>
  );
}
