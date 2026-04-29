import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/dashboard/AdminDashboardClient";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | ShraddhaSetu"
};

export default async function AdminDashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?redirect=/admin-dashboard");
  }
  if (sessionUser.role !== "ADMIN") {
    redirect("/user-dashboard");
  }

  const [services, cities, reviews] = await Promise.all([
    prisma.pujaService.count({ where: { isActive: true } }),
    prisma.city.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isApproved: true } })
  ]);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage bookings, puja services, cities, pandits, reviews and blog.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AdminDashboardClient stats={{ services, cities, reviews }} />
        </div>
      </section>
    </>
  );
}
