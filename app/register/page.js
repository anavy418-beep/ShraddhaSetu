import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register | ShraddhaSetu"
};

export default function RegisterPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <img src="/images/brand/shraddha-setu-logo.png" alt="Shraddha Setu" className="auth-brand-logo" />
          <h1>Create Account</h1>
          <p>Join ShraddhaSetu and track all puja bookings in one dashboard.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <RegisterForm />
              <div style={{ marginTop: 14 }}>
                <Link className="btn btn-outline" href="/login">
                  Already have account?
                </Link>
                {" "}
                <Link className="btn btn-outline" href="/pandit-register">
                  Register as Pandit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
