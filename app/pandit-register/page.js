import PanditRegisterForm from "@/components/auth/PanditRegisterForm";

export const metadata = {
  title: "Pandit Registration | ShraddhaSetu"
};

export default function PanditRegisterPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Pandit Registration Form</h1>
          <p>Join ShraddhaSetu as a verified pandit partner.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <PanditRegisterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
