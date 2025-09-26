import React, { useState } from "react";
import statesCities from "../data/statesCities";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ProposalForm = () => {
  const [formData, setFormData] = useState({
    preparedBy: "",
    email: "",
    customerName: "",
    customerSegment: "",
    requirementType: "",
    state: "",
    cities: [],
    otherCity: "",
    vehicleCondition: "",
    vehiclesWithin: { bls: 0, als: 0, pt: 0 },
    vehiclesBeyond: { bls: 0, als: 0, pt: 0 },
    driversIncluded: false,
    driverCount: 0,
    driverSkill: "",
    paramedicsIncluded: false,
    paramedicCount: 0,
    paramedicSkill: "",
    indicativeStartMonth: "",
    sla: "",
    specialRequirements: "",
    billingPattern: "",
    minCharge: "",
    expectedUsage: "",
    expectedRevenue: "",
    otherRevenue: "",
    discount: "",
    contractDuration: "",
    dieselIncluded: false,
    maintenanceIncluded: false,
    otherInclusion: "",
    termsOfPayment: "",
    riskFactors: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCityChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData({ ...formData, cities: values });
  };

  const handleVehicleChange = (location, type, value) => {
    setFormData({
      ...formData,
      [location]: {
        ...formData[location],
        [type]: Number(value),
      },
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await fetch("https://script.google.com/macros/s/AKfycbwrYScUdqrTv75OMoZamnnbTDVxse9n1wHGHRqUApYQX2n4HK8_7Q-ifC_Qp4lGJ6U3/exec", {
      method: "POST",
      mode: "no-cors",  // 👈 bypass CORS restrictions
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    // Even though we can’t read a response (because of no-cors),
    // we assume success and move to the "Submitted" state.
    setSubmitted(true);

    // Scroll back up so user sees the summary
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Submission failed. Please try again.");
  }
};



  const handleExportPDF = async () => {
    const input = document.getElementById("proposal-summary");
    if (!input) {
      alert("Cannot find summary area to export.");
      return;
    }
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = margin;
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);

      let heightLeft = imgHeight - (pdfHeight - margin * 2);
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - heightLeft;
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - margin * 2;
      }

      const fileName = `proposal_${(formData.customerName || "export").replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF. See console for details.");
    }
  };

  // Prevent Enter key from submitting the form
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Summary after submission
  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          ✅ Proposal Submitted Successfully
        </h2>

        <div id="proposal-summary" className="bg-gray-50 p-6 rounded shadow-sm">
          {/* CUSTOMER DETAILS */}
          <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div><strong>Prepared By:</strong> {formData.preparedBy || "-"}</div>
            <div><strong>Email:</strong> {formData.email || "-"}</div>
            <div><strong>Customer Name:</strong> {formData.customerName || "-"}</div>
            <div><strong>Segment:</strong> {formData.customerSegment || "-"}</div>
            <div><strong>Requirement Type:</strong> {formData.requirementType || "-"}</div>
          </div>

          {/* LOCATION */}
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div><strong>State:</strong> {formData.state || "-"}</div>
            <div><strong>Cities:</strong> {(formData.cities || []).join(", ") || "-"}</div>
          </div>

          {/* VEHICLES */}
          <h3 className="text-lg font-semibold mb-2">Vehicles</h3>
          <div className="mb-3">
            <h4 className="font-medium">Within City Limits</h4>
            <div className="grid grid-cols-3 gap-2">
              <div><strong>BLS:</strong> {formData.vehiclesWithin.bls || 0}</div>
              <div><strong>ALS:</strong> {formData.vehiclesWithin.als || 0}</div>
              <div><strong>PT:</strong> {formData.vehiclesWithin.pt || 0}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Beyond City Limits</h4>
            <div className="grid grid-cols-3 gap-2">
              <div><strong>BLS:</strong> {formData.vehiclesBeyond.bls || 0}</div>
              <div><strong>ALS:</strong> {formData.vehiclesBeyond.als || 0}</div>
              <div><strong>PT:</strong> {formData.vehiclesBeyond.pt || 0}</div>
            </div>
          </div>

          {/* STAFFING */}
          <h3 className="text-lg font-semibold mb-2 mt-3">Staffing</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <strong>Drivers:</strong>{" "}
              {formData.driversIncluded ? `${formData.driverCount || 0} (${formData.driverSkill || "N/A"})` : "Not included"}
            </div>
            <div>
              <strong>Paramedics:</strong>{" "}
              {formData.paramedicsIncluded ? `${formData.paramedicCount || 0} (${formData.paramedicSkill || "N/A"})` : "Not included"}
            </div>
          </div>

          {/* SERVICE & FINANCIALS */}
          <h3 className="text-lg font-semibold mb-2">Service & Financials</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>Indicative Start Month:</strong> {formData.indicativeStartMonth ? new Date(formData.indicativeStartMonth + "-01").toLocaleString(undefined, { month: "long", year: "numeric" }) : "-"}</div>
            <div><strong>SLA (mins):</strong> {formData.sla || "-"}</div>
            <div><strong>Billing Pattern:</strong> {formData.billingPattern || "-"}</div>
            <div><strong>Minimum Charge (₹):</strong> {formData.minCharge || "-"}</div>
            <div><strong>Expected Usage (KM/month):</strong> {formData.expectedUsage || "-"}</div>
            <div><strong>Expected Monthly Revenue (₹):</strong> {formData.expectedRevenue || "-"}</div>
            <div><strong>Discount (%):</strong> {formData.discount || "-"}</div>
            <div><strong>Contract Duration (months):</strong> {formData.contractDuration || "-"}</div>
          </div>
          <div className="col-span-2 mt-2"><strong>Special Requirements:</strong> <div className="whitespace-pre-wrap">{formData.specialRequirements || "-"}</div></div>
          <div className="col-span-2 mt-2"><strong>Other Revenue Opportunities:</strong> <div className="whitespace-pre-wrap">{formData.otherRevenue || "-"}</div></div>
          <div className="mt-2"><strong>Diesel Included:</strong> {formData.dieselIncluded ? "Yes" : "No"}</div>
          <div><strong>Maintenance Included:</strong> {formData.maintenanceIncluded ? "Yes" : "No"}</div>
          <div><strong>Other Inclusion:</strong> {formData.otherInclusion || "-"}</div>
          <div className="col-span-2 mt-2"><strong>Terms of Payment:</strong> <div className="whitespace-pre-wrap">{formData.termsOfPayment || "-"}</div></div>
          <div className="col-span-2 mt-2"><strong>Risk Factors:</strong> <div className="whitespace-pre-wrap">{formData.riskFactors || "-"}</div></div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={() => { setSubmitted(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Submit Another
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-700 text-white rounded"
          >
            Export as PDF
          </button>
        </div>
      </div>
    );
  }

  // Actual form
  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md rounded p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Proposal Submission</h2>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
        
        {/* --- BASIC INFO --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Prepared By</label>
              <input type="text" name="preparedBy" value={formData.preparedBy} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block font-medium">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block font-medium">Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block font-medium">Customer Segment</label>
              <select name="customerSegment" value={formData.customerSegment} onChange={handleChange} className="w-full border rounded p-2" required>
                <option value="">Select</option>
                <option>Hospital</option>
                <option>Government</option>
                <option>Private Company</option>
                <option>Event Organiser</option>
                <option>Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-medium">Requirement Type</label>
              <select name="requirementType" value={formData.requirementType} onChange={handleChange} className="w-full border rounded p-2" required>
                <option value="">Select</option>
                <option>Event</option>
                <option>Subscription</option>
                <option>Medu ERS</option>
                <option>Medu Clinic</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- LOCATION --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">State</label>
              <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value, cities: [] })} className="w-full border rounded p-2">
                <option value="">Select State</option>
                {Object.keys(statesCities).map((state, idx) => (
                  <option key={idx} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Cities (Multi-select)</label>
              <select multiple value={formData.cities} onChange={handleCityChange} className="w-full border rounded p-2">
                {formData.state && statesCities[formData.state]?.map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
                <option value="Other">Other City</option>
              </select>
              {formData.cities.includes("Other") && (
                <input type="text" placeholder="Enter City" value={formData.otherCity} onChange={(e) => setFormData({ ...formData, otherCity: e.target.value })} className="w-full border rounded p-2 mt-2" />
              )}
            </div>
          </div>
        </div>

        {/* --- VEHICLES --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Vehicles Required</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Within City */}
            <div>
              <h4 className="font-medium mb-2">Within City Limits</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label>BLS</label>
                  <input type="number" value={formData.vehiclesWithin.bls} onChange={(e) => handleVehicleChange("vehiclesWithin", "bls", e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label>ALS</label>
                  <input type="number" value={formData.vehiclesWithin.als} onChange={(e) => handleVehicleChange("vehiclesWithin", "als", e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label>PT</label>
                  <input type="number" value={formData.vehiclesWithin.pt} onChange={(e) => handleVehicleChange("vehiclesWithin", "pt", e.target.value)} className="w-full border rounded p-2" />
                </div>
              </div>
            </div>

            {/* Beyond City */}
            <div>
              <h4 className="font-medium mb-2">Beyond City Limits</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label>BLS</label>
                  <input type="number" value={formData.vehiclesBeyond.bls} onChange={(e) => handleVehicleChange("vehiclesBeyond", "bls", e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label>ALS</label>
                  <input type="number" value={formData.vehiclesBeyond.als} onChange={(e) => handleVehicleChange("vehiclesBeyond", "als", e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label>PT</label>
                  <input type="number" value={formData.vehiclesBeyond.pt} onChange={(e) => handleVehicleChange("vehiclesBeyond", "pt", e.target.value)} className="w-full border rounded p-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- STAFFING --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Staffing</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Drivers */}
            <div>
              <label className="block font-medium">Driver Included</label>
              <input type="checkbox" name="driversIncluded" checked={formData.driversIncluded} onChange={handleChange} /> Yes
              {formData.driversIncluded && (
                <div className="mt-2">
                  <input type="number" name="driverCount" placeholder="Count" value={formData.driverCount} onChange={handleChange} className="w-24 border rounded p-1" />
                  <div className="mt-2 flex gap-4">
                    <label><input type="radio" name="driverSkill" value="Skilled" checked={formData.driverSkill === "Skilled"} onChange={handleChange} /> Skilled</label>
                    <label><input type="radio" name="driverSkill" value="Semi-skilled" checked={formData.driverSkill === "Semi-skilled"} onChange={handleChange} /> Semi-skilled</label>
                  </div>
                </div>
              )}
            </div>
            {/* Paramedics */}
            <div>
              <label className="block font-medium">Paramedic Included</label>
              <input type="checkbox" name="paramedicsIncluded" checked={formData.paramedicsIncluded} onChange={handleChange} /> Yes
              {formData.paramedicsIncluded && (
                <div className="mt-2">
                  <input type="number" name="paramedicCount" placeholder="Count" value={formData.paramedicCount} onChange={handleChange} className="w-24 border rounded p-1" />
                  <div className="mt-2 flex gap-4">
                    <label><input type="radio" name="paramedicSkill" value="Skilled" checked={formData.paramedicSkill === "Skilled"} onChange={handleChange} /> Skilled</label>
                    <label><input type="radio" name="paramedicSkill" value="Semi-skilled" checked={formData.paramedicSkill === "Semi-skilled"} onChange={handleChange} /> Semi-skilled</label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- FINANCIALS --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Financials</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Indicative Start Month</label>
              <input type="month" name="indicativeStartMonth" value={formData.indicativeStartMonth} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label>SLA (responsetime)</label>
              <input type="number" name="sla" value={formData.sla} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="mt-3">
            <label>Special Requirements</label>
            <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} className="w-full border rounded p-2" rows="2" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label>Billing Pattern</label>
              <select name="billingPattern" value={formData.billingPattern} onChange={handleChange} className="w-full border rounded p-2">
                <option value="">Select</option>
                <option>Per Km</option>
                <option>Per Trip</option>
                <option>Monthly</option>
                <option>Per Activity</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label>Min Charge (₹)</label>
              <input type="number" name="minCharge" value={formData.minCharge} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label>Expected Usage (KM/month)</label>
              <input type="number" name="expectedUsage" value={formData.expectedUsage} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label>Expected Revenue (₹)</label>
              <input type="number" name="expectedRevenue" value={formData.expectedRevenue} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label>Discount (%)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label>Contract Duration (months)</label>
              <input type="number" name="contractDuration" value={formData.contractDuration} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="mt-3">
            <label>Other Revenue Opportunities</label>
            <textarea name="otherRevenue" value={formData.otherRevenue} onChange={handleChange} className="w-full border rounded p-2" rows="2" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label><input type="checkbox" name="dieselIncluded" checked={formData.dieselIncluded} onChange={handleChange} /> Diesel Included</label>
            </div>
            <div>
              <label><input type="checkbox" name="maintenanceIncluded" checked={formData.maintenanceIncluded} onChange={handleChange} /> Maintenance Included</label>
            </div>
            <div>
              <label>Other Inclusion</label>
              <input type="text" name="otherInclusion" value={formData.otherInclusion} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>
        </div>

        {/* --- TERMS --- */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Terms</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Terms of Payment</label>
              <textarea name="termsOfPayment" value={formData.termsOfPayment} onChange={handleChange} className="w-full border rounded p-2" rows="2" />
            </div>
            <div>
              <label>Risk Factors</label>
              <textarea name="riskFactors" value={formData.riskFactors} onChange={handleChange} className="w-full border rounded p-2" rows="2" />
            </div>
          </div>
        </div>

        {/* --- SUBMIT --- */}
        <div className="text-center">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
            Submit Proposal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;






-- geography list
const statesCities = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Rajahmundry", "Tirupati", "Anantapur", "Kadapa", "Eluru",
    "Machilipatnam", "Chittoor", "Ongole", "Srikakulam", "Vizianagaram",
    "Amaravati", "Proddatur", "Tenali", "Adoni", "Nandyal"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro",
    "Bomdila", "Along", "Roing", "Tezu", "Khonsa",
    "Changlang", "Seppa", "Yingkiong", "Daporijo", "Aalo",
    "Anini", "Namsai", "Dirang", "Hayuliang", "Mechuka"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur",
    "Tinsukia", "Nagaon", "Bongaigaon", "Karimganj", "Goalpara",
    "Dhubri", "Lakhimpur", "Diphu", "Hailakandi", "Barpeta",
    "Kokrajhar", "Sivasagar", "Mariani", "North Lakhimpur", "Haflong"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
    "Purnia", "Arrah", "Begusarai", "Katihar", "Munger",
    "Chhapra", "Danapur", "Saharsa", "Hajipur", "Bettiah",
    "Motihari", "Siwan", "Sitamarhi", "Dehri", "Sasaram"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg",
    "Jagdalpur", "Ambikapur", "Rajnandgaon", "Raigarh", "Dhamtari",
    "Mahasamund", "Kanker", "Kawardha", "Surguja", "Janjgir",
    "Balod", "Bijapur", "Dantewada", "Mungeli", "Sukma"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Curchorem", "Bicholim", "Canacona", "Quepem", "Sanquelim",
    "Valpoi", "Sanguem", "Tivim", "Calangute", "Colva",
    "Anjuna", "Siolim", "Aldona", "Chicalim", "Cuncolim"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad",
    "Morbi", "Surendranagar", "Porbandar", "Navsari", "Valsad",
    "Bharuch", "Mehsana", "Godhra", "Patan", "Amreli"
  ],
  "Haryana": [
    "Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula",
    "Bhiwani", "Sirsa", "Jind", "Kaithal", "Rewari",
    "Bahadurgarh", "Palwal", "Kurukshetra", "Mahendragarh", "Narnaul"
  ],
  "Himachal Pradesh": [
    "Shimla", "Solan", "Dharamshala", "Mandi", "Bilaspur",
    "Kullu", "Chamba", "Una", "Nahan", "Palampur",
    "Hamirpur", "Kangra", "Sundarnagar", "Baddi", "Parwanoo",
    "Keylong", "Rampur", "Nurpur", "Dalhousie", "Jawalamukhi"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
    "Deoghar", "Phusro", "Giridih", "Ramgarh", "Medininagar",
    "Chirkunda", "Godda", "Gumia", "Chaibasa", "Sahibganj",
    "Simdega", "Jamtara", "Pakur", "Latehar", "Koderma"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi",
    "Shivamogga", "Tumakuru", "Ballari", "Davangere", "Raichur",
    "Hassan", "Bidar", "Hospet", "Chitradurga", "Udupi",
    "Chikmagalur", "Mandya", "Bagalkot", "Gadag", "Kolar"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur",
    "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam",
    "Pathanamthitta", "Idukki", "Manjeri", "Payyanur", "Varkala",
    "Punalur", "Neyyattinkara", "Adoor", "Perumbavoor", "Muvattupuzha"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Murwara", "Burhanpur", "Khandwa", "Bhind", "Chhindwara",
    "Guna", "Shivpuri", "Mandsaur", "Neemuch", "Sehore"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik",
    "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli",
    "Jalgaon", "Akola", "Latur", "Dhule", "Chandrapur",
    "Parbhani", "Ahmednagar", "Satara", "Beed", "Wardha"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Kakching", "Ukhrul",
    "Senapati", "Churachandpur", "Jiribam", "Tamenglong", "Moreh",
    "Lilong", "Kangpokpi", "Moirang", "Noney", "Andro",
    "Oinam", "Karong", "Mao", "Kumbi", "Nambol"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara",
    "Williamnagar", "Resubelpara", "Mairang", "Cherrapunji", "Mawkyrwat",
    "Nongpoh", "Khliehriat", "Ranikor", "Sohra", "Ampati",
    "Umsning", "Smit", "Pynursla", "Nartiang", "Mawphlang"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip",
    "Saiha", "Lawngtlai", "Mamit", "North Vanlaiphai", "Biate",
    "Sairang", "Sialsuk", "Khawzawl", "Zawlnuam", "N. Vanlaiphai",
    "Tuipang", "Thingsulthliah", "Phullen", "Thenzawl", "Darlawn"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Mon",
    "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng",
    "Chumukedima", "Tuli", "Meluri", "Pfutsero", "Noklak",
    "Changtongya", "Satakha", "Tamlu", "Aboi", "Shamator"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur",
    "Balasore", "Baripada", "Bhadrak", "Jharsuguda", "Jeypore",
    "Kendrapara", "Rayagada", "Angul", "Paradip", "Bargarh",
    "Phulbani", "Koraput", "Sonepur", "Nayagarh", "Puri"
  ],
  "Punjab": [
    "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar",
    "Khanna", "Phagwara", "Kapurthala", "Faridkot", "Sangrur",
    "Barnala", "Rupnagar", "Firozpur", "Muktsar", "Gurdaspur"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer",
    "Bikaner", "Alwar", "Sikar", "Bhilwara", "Pali",
    "Tonk", "Chittorgarh", "Barmer", "Jhunjhunu", "Nagaur",
    "Hanumangarh", "Dausa", "Banswara", "Jaisalmer", "Bundi"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo",
    "Jorethang", "Singtam", "Ravangla", "Soreng", "Chungthang",
    "Lachung", "Lachen", "Rhenock", "Dzongu", "Dentam",
    "Singtam", "Yangang", "Zuluk", "Kabi", "Tumin"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Erode", "Vellore", "Thoothukudi", "Tirunelveli", "Dindigul",
    "Thanjavur", "Cuddalore", "Kanchipuram", "Nagapattinam", "Karur",
    "Nagercoil", "Pudukkottai", "Sivakasi", "Virudhunagar", "Ariyalur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar",
    "Mahbubnagar", "Adilabad", "Ramagundam", "Suryapet", "Miryalaguda",
    "Jagtial", "Mancherial", "Siddipet", "Nalgonda", "Kamareddy",
    "Medak", "Kothagudem", "Zaheerabad", "Wanaparthy", "Vikarabad"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Kailashahar", "Dharmanagar", "Belonia",
    "Khowai", "Teliamura", "Ambassa", "Sonamura", "Amarpur",
    "Bishalgarh", "Sabroom", "Melaghar", "Ranirbazar", "Kamalpur",
    "Panisagar", "Mohanpur", "Gakulnagar", "Jirania", "Gandhigram"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj",
    "Ghaziabad", "Noida", "Meerut", "Bareilly", "Aligarh",
    "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Mathura",
    "Firozabad", "Ayodhya", "Shahjahanpur", "Rampur", "Bijnor"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee",
    "Kashipur", "Rudrapur", "Nainital", "Pauri", "Tehri",
    "Almora", "Pithoragarh", "Bageshwar", "Champawat", "Kotdwar",
    "Mussoorie", "Joshimath", "Devprayag", "Srinagar", "Ranikhet"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Malda", "Kharagpur", "Haldia", "Jalpaiguri",
    "Bankura", "Raiganj", "Cooch Behar", "Krishnanagar", "Midnapore",
    "Alipurduar", "Chinsurah", "Bally", "Serampore", "Raniganj"
  ]
};

export default statesCities;