import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login | ShraddhaSetu"
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = params?.redirect || "";

  return (
    <>
      <section className="page-header">
        <div className="container">
          <img src="/images/brand/shraddha-setu-logo.png" alt="Shraddha Setu" className="auth-brand-logo" />
          <h1>Login</h1>
          <p>Sign in to manage your bookings and profile.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body" style={{ maxWidth: 520 }}>
              <LoginForm redirectTo={redirectTo} />
              <div style={{ marginTop: 14 }}>
                <Link className="btn btn-outline" href="/register">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
