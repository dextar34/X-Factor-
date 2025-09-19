import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiTrash2, FiPlus, FiDownload, FiPrinter, FiCheckCircle, FiFacebook, FiInstagram, FiTwitter, FiExternalLink } from "react-icons/fi";
import { MdAttachMoney, MdDiscount } from "react-icons/md";

const servicesList = [
  { name: "Haircut", price: 300 },
  { name: "Beard Trim", price: 200 },
  { name: "Hair Coloring", price: 500 },
  { name: "Facial", price: 600 },
  { name: "Head Massage", price: 250 },
];

const initialProvidersList = [
  { id: "101", name: "Mr. Karim" },
  { id: "102", name: "Mr. Rahman" },
  { id: "103", name: "Mr. Ali" },
  { id: "104", name: "Mr. Hasan" }
];

const paymentMethods = ["Cash", "bKash", "Card", "Other"];

const Invoice = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [useToday, setUseToday] = useState(true);
  const [services, setServices] = useState([
    { service: "", price: 0, people: 1, provider: "", providerId: "" },
  ]);
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [tnxId, setTnxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [integrationSuccess, setIntegrationSuccess] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [providersList, setProvidersList] = useState(initialProvidersList);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: "", id: "" });
  const [contactError, setContactError] = useState("");
  const [notes, setNotes] = useState(""); // Add notes state

  const printRef = useRef();

  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    if (field === "service") {
      const selected = servicesList.find((s) => s.name === value);
      updated[index].service = value;
      updated[index].price = selected ? selected.price : 0;
    } else if (field === "provider") {
      if (value === "add_new") {
        setShowAddProvider(true);
      } else {
        const selectedProvider = providersList.find((p) => p.name === value);
        updated[index].provider = value;
        updated[index].providerId = selectedProvider ? selectedProvider.id : "";
      }
    } else {
      updated[index][field] = value;
    }
    setServices(updated);
  };

  const addNewProvider = () => {
    if (newProvider.name && newProvider.id) {
      const updatedProviders = [...providersList, newProvider];
      setProvidersList(updatedProviders);
      
      // Update the service with the new provider
      const updatedServices = [...services];
      const lastIndex = updatedServices.length - 1;
      updatedServices[lastIndex].provider = newProvider.name;
      updatedServices[lastIndex].providerId = newProvider.id;
      setServices(updatedServices);
      
      setNewProvider({ name: "", id: "" });
      setShowAddProvider(false);
    }
  };

  const addService = () => {
    setServices([
      ...services,
      { service: "", price: 0, people: 1, provider: "", providerId: "" },
    ]);
  };

  const removeService = (index) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const getSubtotal = (s) => (s.price || 0) * (s.people || 1);

  const getTotal = () => {
    let total = services.reduce((sum, s) => sum + getSubtotal(s), 0);
    
    // Apply discount
    if (discountType === "%") {
      total = total - (total * discountValue) / 100;
    } else if (discountType === "amount") {
      total = total - discountValue;
    }
    
    // Apply VAT (5%)
    if (vatEnabled) {
      total = total + (total * 0.05);
    }
    
    // Apply Tax (5%)
    if (taxEnabled) {
      total = total + (total * 0.05);
    }
    
    return total;
  };

  const getSubtotalWithoutFees = () => {
    let subtotal = services.reduce((sum, s) => sum + getSubtotal(s), 0);
    
    // Apply discount
    if (discountType === "%") {
      subtotal = subtotal - (subtotal * discountValue) / 100;
    } else if (discountType === "amount") {
      subtotal = subtotal - discountValue;
    }
    
    return subtotal;
  };

  const generateTransactionId = () => {
    const random4Num = Math.floor(1000 + Math.random() * 9000);
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getFullYear().toString().slice(-2)}`;
    
    // Get the first provider ID from services
    const providerId = services[0]?.providerId || "000";
    
    const totalAmount = Math.round(getTotal());
    const firstLetter = name.charAt(0).toUpperCase();
    const last3Digits = contact.slice(-3);
    
    return `X${random4Num}${dateStr}${providerId}${totalAmount}${firstLetter}${last3Digits}`;
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    
    if (value.length !== 11 && value.length > 0) {
      setContactError("Contact number must be 11 digits");
    } else {
      setContactError("");
    }
  };

  const handleGenerate = () => {
    if (!name || !contact) {
      alert("Please fill Name and Contact");
      return;
    }
    
    if (contact.length !== 11) {
      setContactError("Contact number must be 11 digits");
      return;
    }
    
    // Check if all services have providers
    const hasMissingProvider = services.some(s => !s.provider);
    if (hasMissingProvider) {
      alert("Please select a provider for all services");
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
    setTnxId(generateTransactionId());
    setGenerated(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();

    // Header with print-friendly colors (black/gray)
    doc.setFillColor(230, 230, 230);
    doc.rect(0, 0, 220, 40, 'F');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("X-Factor Men's Salon", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      "27/2 Tipu Sultan Road, Wari, Dhaka-1203",
      105,
      22,
      { align: "center" }
    );
    doc.text("Phone: 01730-711712 | Email: xfactorbarber@live.com", 105, 28, { align: "center" });

    // Customer info
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 45, 182, 25, 'F');
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Customer: ${name}`, 20, 52);
    doc.text(`Contact: ${contact}`, 20, 59);
    doc.text(`Date: ${date}`, 110, 52);
    doc.text(`Transaction ID: ${tnxId}`, 110, 59);

    // Table
    autoTable(doc, {
      startY: 74,
      head: [["Service", "Price", "People", "Provider", "Subtotal"]],
      body: services.map((s) => [
        s.service,
        `${s.price} tk`,
        s.people,
        s.provider,
        `${getSubtotal(s)} tk`,
      ]),
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    const finalY = doc.lastAutoTable.finalY;
    const totalAfterDiscount = getTotal();
    const subtotal = getSubtotalWithoutFees();
    
    // Order summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Order Summary", 14, finalY + 10);
    
    // Subtotal
    doc.text(`Subtotal: ${subtotal.toFixed(2)} tk`, 14, finalY + 20);
    
    // Discount
    if (discountType !== "none") {
      doc.text(`Discount: ${discountValue} ${discountType === "%" ? "%" : "tk"}`, 14, finalY + 30);
    }
    
    // VAT
    if (vatEnabled) {
      doc.text(`VAT (5%): ${(subtotal * 0.05).toFixed(2)} tk`, 14, finalY + 40);
    }
    
    // Tax
    if (taxEnabled) {
      doc.text(`Tax (5%): ${(subtotal * 0.05).toFixed(2)} tk`, 14, finalY + 50);
    }
    
    // Payment method
    doc.text(`Payment Method: ${paymentMethod}`, 14, finalY + (vatEnabled || taxEnabled ? 60 : 40));
    
    // Total section
    doc.setFillColor(230, 230, 230);
    const totalY = finalY + (vatEnabled || taxEnabled ? 70 : 50);
    doc.rect(14, totalY, 182, 15, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text(`Total: ${totalAfterDiscount.toFixed(2)} tk`, 160, totalY + 10, { align: "right" });
    
    // Notes section
    if (notes && notes.trim() !== "") {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text("Notes:", 14, totalY + 28);
      doc.setFontSize(10);
      doc.text(notes, 14, totalY + 34, { maxWidth: 180 });
    }
    
    // Social media (text only, no color)
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Follow us on: Facebook | Instagram | Twitter", 14, totalY + 45);

    doc.save(`invoice_${tnxId}.pdf`);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${tnxId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { color: #d4af37; text-align: center; margin-bottom: 20px; }
            .info-section { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
            th { background: #d4af37; color: white; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; font-size: 1.2em; }
            .tnx-id { margin-top: 10px; font-style: italic; }
            .social-icons { margin-top: 20px; text-align: center; }
            .social-icons a { margin: 0 10px; color: #d4af37; font-size: 1.5em; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Function to submit data to Google Sheets
  const submitToGoogleSheets = async () => {
    setIsSubmitting(true);
    
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyPRb4A-Z53p36oSy9nLGFJA3G2uVCQt_A-zRJtbtoIO5U2BtJ_vTksQDq5IY4c4SRcoA/exec';
    
    const data = {
      name: name,
      contact: contact,
      date: date,
      services: JSON.stringify(services),
      discountType: discountType,
      discountValue: discountValue,
      vatEnabled: vatEnabled,
      taxEnabled: taxEnabled,
      total: getTotal(),
      tnxId: tnxId,
      paymentMethod: paymentMethod
    };
    
    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      setIntegrationSuccess(true);
      setSheetUrl("https://docs.google.com/spreadsheets/d/1XkV5C4Q8E7qkGvC8n9w6LmZzrJtYhPfU/edit");
      alert('Data successfully saved to Google Sheets!');
    } catch (error) {
      console.error('Error!', error.message);
      alert('Failed to save data to Google Sheets. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-full md:max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-yellow-600">
          X-Factor Salon Invoice
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          Professional grooming services invoice generator
        </p>

        {/* Customer Info */}
        <div className="bg-gray-100 p-3 sm:p-5 rounded-xl mb-6 space-y-4 shadow-inner">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 flex items-center gap-2">
            <FiCheckCircle className="text-yellow-600" />
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="Enter customer name"
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number * (11 digits)
              </label>
              <input
                type="text"
                placeholder="Enter 11-digit contact number"
                className={`border ${contactError ? 'border-red-500' : 'border-gray-300'} p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500`}
                value={contact}
                onChange={handleContactChange}
                maxLength={11}
              />
              {contactError && <p className="text-red-500 text-sm mt-1">{contactError}</p>}
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useToday}
                  onChange={() => setUseToday(!useToday)}
                  className="rounded text-yellow-600 focus:ring-yellow-500"
                />
                Use Today's Date
              </label>
              {!useToday && (
                <input
                  type="date"
                  className="border border-gray-300 p-2 rounded-lg"
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
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <select
              className="border border-gray-300 p-2 rounded-lg"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* VAT and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vatEnabled}
                onChange={() => setVatEnabled(!vatEnabled)}
                className="rounded text-yellow-600 focus:ring-yellow-500"
              />
              <label className="text-sm font-medium text-gray-700">Add VAT (5%)</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={() => setTaxEnabled(!taxEnabled)}
                className="rounded text-yellow-600 focus:ring-yellow-500"
              />
              <label className="text-sm font-medium text-gray-700">Add Tax (5%)</label>
            </div>
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MdDiscount className="text-yellow-600" />
              Discount
            </label>
            <div className="flex flex-wrap gap-4 items-center">
              <select
                className="border border-gray-300 p-2 rounded-lg"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="none">No Discount</option>
                <option value="%">Percentage (%)</option>
                <option value="amount">Fixed Amount</option>
              </select>
              {discountType !== "none" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="border border-gray-300 p-2 rounded-lg w-32"
                    placeholder={discountType === "%" ? "0-100" : "Amount"}
                    value={discountValue}
                    min={0}
                    max={discountType === "%" ? 100 : undefined}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                  />
                  <span>{discountType === "%" ? "%" : "tk"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <MdAttachMoney className="text-yellow-600" />
            Services
          </h3>
          
          <div className="space-y-3">
            {services.map((s, idx) => {
              const isEmpty = !s.service && !s.price && !s.people && !s.provider;
              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-center bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200"
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <select
                      className="border border-gray-300 p-2 rounded-lg w-full"
                      value={s.service}
                      onChange={(e) =>
                        handleServiceChange(idx, "service", e.target.value)
                      }
                    >
                      <option value="">Select Service</option>
                      {servicesList.map((srv) => (
                        <option key={srv.name} value={srv.name}>
                          {srv.name} - {srv.price} tk
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      className="border border-gray-300 p-2 rounded-lg w-full bg-gray-100"
                      value={s.price}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">People</label>
                    <input
                      type="number"
                      className="border border-gray-300 p-2 rounded-lg w-full"
                      min="1"
                      value={s.people}
                      onChange={(e) =>
                        handleServiceChange(idx, "people", Number(e.target.value))
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                    <select
                      className="border border-gray-300 p-2 rounded-lg w-full"
                      value={s.provider}
                      onChange={(e) =>
                        handleServiceChange(idx, "provider", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Provider</option>
                      {providersList.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} (ID: {p.id})
                        </option>
                      ))}
                      <option value="add_new">+ Add New Provider</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-center">
                    {!isEmpty && (
                      <button
                        onClick={() => removeService(idx)}
                        className="text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove service"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={addService}
              className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mt-2 sm:mt-4"
            >
              <FiPlus /> Add Service
            </button>
          </div>
        </div>

        {/* Add New Provider Modal */}
        {showAddProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-xl w-[95vw] max-w-xs sm:max-w-md">
              <h3 className="text-xl font-semibold mb-4">Add New Provider</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name *</label>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded-lg w-full"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider ID *</label>
                  <input
                    type="text"
                    className="border border-gray-300 p-2 rounded-lg w-full"
                    value={newProvider.id}
                    onChange={(e) => setNewProvider({...newProvider, id: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowAddProvider(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewProvider}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    disabled={!newProvider.name || !newProvider.id}
                  >
                    Add Provider
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="bg-yellow-50 p-3 sm:p-5 rounded-xl mb-6 border border-yellow-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Order Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 flex justify-between">
                <span>Subtotal:</span> 
                <span>{services.reduce((sum, s) => sum + getSubtotal(s), 0)} tk</span>
              </p>
              
              {discountType !== "none" && (
                <p className="text-gray-600 flex justify-between">
                  <span>Discount:</span> 
                  <span>{discountValue} {discountType === "%" ? "%" : "tk"}</span>
                </p>
              )}
              
              {vatEnabled && (
                <p className="text-gray-600 flex justify-between">
                  <span>VAT (5%):</span> 
                  <span>{(getSubtotalWithoutFees() * 0.05).toFixed(2)} tk</span>
                </p>
              )}
              
              {taxEnabled && (
                <p className="text-gray-600 flex justify-between">
                  <span>Tax (5%):</span> 
                  <span>{(getSubtotalWithoutFees() * 0.05).toFixed(2)} tk</span>
                </p>
              )}
              
              <p className="text-gray-600 flex justify-between mt-2">
                <span>Payment Method:</span> 
                <span>{paymentMethod}</span>
              </p>
            </div>
            
            <div className="text-2xl font-bold text-yellow-700 flex justify-between items-center">
              <span>Total:</span> 
              <span>{getTotal().toFixed(2)} tk</span>
            </div>
          </div>
        </div>

        {/* Notes Option */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            className="border border-gray-300 p-2 rounded-lg w-full min-h-[60px] resize-y"
            placeholder="Add any notes for this invoice (e.g. special instructions, thank you message, etc.)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={handleGenerate}
            disabled={!name || !contact || contact.length !== 11}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FiCheckCircle size={18} /> Generate Invoice
          </button>
          
          {generated && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiDownload size={18} /> Download PDF
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiPrinter size={18} /> Print Invoice
              </button>
              
              <button
                onClick={submitToGoogleSheets}
                disabled={isSubmitting || integrationSuccess}
                className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? "Saving..." : integrationSuccess ? "Saved to Sheets!" : "Save to Google Sheets"}
              </button>
            </>
          )}
        </div>

        {/* Google Sheet Link */}
        {integrationSuccess && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
              <FiCheckCircle /> Google Sheets Integration Successful!
            </h3>
            <p className="text-green-700 mb-2">
              Your invoice data has been saved to Google Sheets.
            </p>
            <a
              href="https://docs.google.com/spreadsheets/d/1XkV5C4Q8E7qkGvC8n9w6LmZzrJtYhPfU/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <FiExternalLink /> Open Your Google Sheet
            </a>
          </div>
        )}
      </div>

      {/* Preview */}
      {generated && (
        <div
          ref={printRef}
          className="mt-6 p-3 sm:p-6 border rounded-xl bg-white shadow overflow-x-auto"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">X-Factor Men's Salon</h2>
            <p className="text-gray-600 text-xs sm:text-base">27/2 Tipu Sultan Road, Wari, Dhaka-1203</p>
            <p className="text-gray-600 text-xs sm:text-base">Phone: 01730-711712 | Email: xfactorbarber@live.com</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-100 p-3 sm:p-4 rounded-lg">
            <div>
              <p><strong>Customer:</strong> {name}</p>
              <p><strong>Contact:</strong> {contact}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {date}</p>
              <p><strong>Transaction ID:</strong> {tnxId}</p>
              <p><strong>Payment Method:</strong> {paymentMethod}</p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full mt-4 border-collapse border border-gray-300 text-xs sm:text-base">
              <thead>
                <tr className="bg-yellow-600 text-white">
                  <th className="border border-gray-300 p-3">Service</th>
                  <th className="border border-gray-300 p-3">Price</th>
                  <th className="border border-gray-300 p-3">People</th>
                  <th className="border border-gray-300 p-3">Provider</th>
                  <th className="border border-gray-300 p-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="border border-gray-300 p-3">{s.service}</td>
                    <td className="border border-gray-300 p-3">{s.price} tk</td>
                    <td className="border border-gray-300 p-3">{s.people}</td>
                    <td className="border border-gray-300 p-3">{s.provider}</td>
                    <td className="border border-gray-300 p-3">{getSubtotal(s)} tk</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-3 sm:p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">Order Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <p>Subtotal:</p>
              <p className="text-right">{services.reduce((sum, s) => sum + getSubtotal(s), 0)} tk</p>
              
              {discountType !== "none" && (
                <>
                  <p>Discount:</p>
                  <p className="text-right">{discountValue} {discountType === "%" ? "%" : "tk"}</p>
                </>
              )}
              
              {vatEnabled && (
                <>
                  <p>VAT (5%):</p>
                  <p className="text-right">{(getSubtotalWithoutFees() * 0.05).toFixed(2)} tk</p>
                </>
              )}
              
              {taxEnabled && (
                <>
                  <p>Tax (5%):</p>
                  <p className="text-right">{(getSubtotalWithoutFees() * 0.05).toFixed(2)} tk</p>
                </>
              )}
              
              <p className="font-bold mt-2">Payment Method:</p>
              <p className="text-right font-bold mt-2">{paymentMethod}</p>
              
              <p className="font-bold mt-2">Total:</p>
              <p className="text-right font-bold mt-2">{getTotal().toFixed(2)} tk</p>
            </div>
            {/* Notes in preview */}
            {notes && notes.trim() !== "" && (
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-1">Notes:</h5>
                <p className="text-gray-700 whitespace-pre-line text-sm">{notes}</p>
              </div>
            )}
          </div>

          <div className="social-icons mt-6 text-center">
            <p className="text-yellow-600 font-semibold">Follow us on:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <a href="#" className="text-blue-600"><FiFacebook size={24} /></a>
              <a href="#" className="text-pink-600"><FiInstagram size={24} /></a>
              <a href="#" className="text-blue-400"><FiTwitter size={24} /></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;