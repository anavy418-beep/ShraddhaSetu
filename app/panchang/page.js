import { getCities } from "@/lib/queries";

const panchangData = {
  tithi: "Shukla Tritiya",
  nakshatra: "Rohini",
  yog: "Siddhi",
  karan: "Garaja",
  sunrise: "05:42 AM",
  sunset: "06:53 PM",
  rahuKaal: "01:30 PM - 03:00 PM"
};

export const metadata = {
  title: "Daily Panchang | ShraddhaSetu"
};

export default async function PanchangPage() {
  const cities = await getCities();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Daily Panchang</h1>
          <p>Track essential Vedic calendar details for your selected city and date.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <div className="form-grid">
                <select defaultValue="Delhi">
                  {cities.map((city) => (
                    <option key={city.id}>{city.name}</option>
                  ))}
                </select>
                <input type="date" />
              </div>
              <table style={{ marginTop: 20 }}>
                <tbody>
                  <tr>
                    <th>Tithi</th>
                    <td>{panchangData.tithi}</td>
                  </tr>
                  <tr>
                    <th>Nakshatra</th>
                    <td>{panchangData.nakshatra}</td>
                  </tr>
                  <tr>
                    <th>Yog</th>
                    <td>{panchangData.yog}</td>
                  </tr>
                  <tr>
                    <th>Karan</th>
                    <td>{panchangData.karan}</td>
                  </tr>
                  <tr>
                    <th>Sunrise</th>
                    <td>{panchangData.sunrise}</td>
                  </tr>
                  <tr>
                    <th>Sunset</th>
                    <td>{panchangData.sunset}</td>
                  </tr>
                  <tr>
                    <th>Rahu Kaal</th>
                    <td>{panchangData.rahuKaal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
