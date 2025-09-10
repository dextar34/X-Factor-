import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AiFillDelete } from "react-icons/ai";

const servicesList = [
  { name: "Service 1", price: 100 },
  { name: "Service 2", price: 200 },
  { name: "Service 3", price: 150 },
];

const providersList = ["Mr. Karim", "Mr. Rahman", "Mr. Ali"];

const Invoice = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [useToday, setUseToday] = useState(true);
  const [services, setServices] = useState([
    { service: "", price: 0, people: 1, provider: "" },
  ]);
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [generated, setGenerated] = useState(false);

  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    if (field === "service") {
      const selected = servicesList.find((s) => s.name === value);
      updated[index].service = value;
      updated[index].price = selected ? selected.price : 0;
    } else {
      updated[index][field] = value;
    }
    setServices(updated);
  };

  const addService = () => {
    setServices([...services, { service: "", price: 0, people: 1, provider: "" }]);
  };

  const removeService = (index) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const getSubtotal = (s) => (s.price || 0) * (s.people || 1);

  const getTotal = () => {
    const total = services.reduce((sum, s) => sum + getSubtotal(s), 0);
    if (discountType === "%") return total - (total * discountValue) / 100;
    if (discountType === "amount") return total - discountValue;
    return total;
  };

  const handleGenerate = () => {
    if (!name || !contact) {
      alert("Please fill Name and Contact");
      return;
    }
    if (useToday) {
      const today = new Date();
      const formatted = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      setDate(formatted);
    }
    setGenerated(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(212, 175, 55); // Golden color
    doc.text("X-Factor Men's Salon", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(
      "27/2 Tipu Shultan Road, Wari, Dhaka-1203 (Opposite Khana’s Restaurant & Bio-Xin, Dhaka, Bangladesh)",
      14,
      28
    );
    doc.text("Phone: 01730-711712 | Email: xfactorbarber@live.com", 14, 34);

    // Customer info
    doc.setFontSize(12);
    doc.text(`Customer: ${name}`, 14, 45);
    doc.text(`Contact: ${contact}`, 14, 52);
    doc.text(`Date: ${date}`, 14, 59);
    doc.text(`Discount: ${discountType !== "none" ? discountValue + (discountType==="%"?"%":" tk") : "0"}`, 14, 66);

    // Table
    autoTable(doc, {
      startY: 74,
      head: [["Service", "Price", "People", "Provider", "Subtotal"]],
      body: services.map((s) => [
        s.service,
        s.price,
        s.people,
        s.provider,
        getSubtotal(s),
      ]),
    });

    const finalY = doc.lastAutoTable.finalY;
    const totalAfterDiscount = getTotal();
    doc.text(`Total: ${totalAfterDiscount} tk`, 14, finalY + 10);

    // Transaction ID (total + timestamp, admin-readable)
    const tnxId = `X${Math.round(totalAfterDiscount)}${Date.now().toString().slice(-5)}`;
    doc.text(`Transaction ID: ${tnxId}`, 14, finalY + 20);

    doc.save("invoice.pdf");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-yellow-500">
        X-Factor Invoice
      </h2>

      {/* Customer Info */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4 space-y-4">
        <input
          type="text"
          placeholder="Customer Name"
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Contact Number"
          className="border p-2 w-full rounded"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        {/* Date */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useToday}
              onChange={() => setUseToday(!useToday)}
            />
            Use Today’s Date
          </label>
          {!useToday && (
            <input
              type="date"
              className="border p-2 rounded"
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const formatted = selectedDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });
                setDate(formatted);
              }}
            />
          )}
        </div>

        {/* Discount */}
        <div className="flex gap-4 items-center">
          <label>Discount Type:</label>
          <select
            className="border p-2 rounded"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="none">None</option>
            <option value="%">%</option>
            <option value="amount">Amount</option>
          </select>
          {discountType !== "none" && (
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="Discount Value"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Services */}
      <div className="space-y-2 mb-4">
        {services.map((s, idx) => (
          <div
            key={idx}
            className="grid grid-cols-5 gap-2 items-center bg-gray-50 p-2 rounded"
          >
            <select
              className="border p-1 rounded"
              value={s.service}
              onChange={(e) => handleServiceChange(idx, "service", e.target.value)}
            >
              <option value="">Select Service</option>
              {servicesList.map((srv) => (
                <option key={srv.name} value={srv.name}>
                  {srv.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="border p-1 rounded bg-gray-100"
              value={s.price}
              readOnly
            />
            <input
              type="number"
              className="border p-1 rounded"
              min="1"
              value={s.people}
              onChange={(e) => handleServiceChange(idx, "people", e.target.value)}
            />
            <select
              className="border p-1 rounded"
              value={s.provider}
              onChange={(e) =>
                handleServiceChange(idx, "provider", e.target.value)
              }
            >
              <option value="">Select Provider</option>
              {providersList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button onClick={() => removeService(idx)} className="text-red-500">
              <AiFillDelete size={20} />
            </button>
          </div>
        ))}
        <button
          onClick={addService}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add More Service
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Generate Invoice
        </button>
        <button
          onClick={handleDownload}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Download PDF
        </button>
      </div>

      {/* Preview */}
      {generated && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h3 className="text-lg font-semibold mb-2 text-yellow-500">
            Invoice Preview
          </h3>
          <p><strong>Customer:</strong> {name}</p>
          <p><strong>Contact:</strong> {contact}</p>
          <p><strong>Date:</strong> {date}</p>
          <p>
            <strong>Discount:</strong>{" "}
            {discountType !== "none" ? discountValue + (discountType === "%" ? "%" : " tk") : "0"}
          </p>

          <table className="w-full mt-4 border">
            <thead>
              <tr className="bg-yellow-200">
                <th className="border p-2">Service</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">People</th>
                <th className="border p-2">Provider</th>
                <th className="border p-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td className="border p-2">{s.service}</td>
                  <td className="border p-2">{s.price}</td>
                  <td className="border p-2">{s.people}</td>
                  <td className="border p-2">{s.provider}</td>
                  <td className="border p-2">{getSubtotal(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-2 font-bold">Total: {getTotal()} tk</p>
        </div>
      )}
    </div>
  );
};

export default Invoice;
