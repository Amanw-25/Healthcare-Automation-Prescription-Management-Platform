import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CreditCard, Printer, Download, Check, X, Loader } from 'lucide-react';

const PatientCheckInSystem = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('search'); // search, details, payment, receipt
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    weight: '',
    address: '',
    reason: '',
    amount: ''
  });
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    weight: '',
    address: ''
  });
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  // API base URL
  const API_BASE_URL = 'http://localhost:5130/api/v1/hms';

  // Handle input changes for main form
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle input changes for new patient form
  const handleNewPatientChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace('new', '').toLowerCase();
    setNewPatient({
      ...newPatient,
      [fieldName]: value
    });
  };

  // Search for a patient
  const searchPatient = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Real API call to your backend
      const response = await fetch(`${API_BASE_URL}/patients/search?query=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Patient not found');
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setPatient(data.data);
        setFormData({
          ...formData,
          name: data.data.name,
          phone: data.data.phone,
          email: data.data.email || '',
          age: data.data.age || '',
          weight: data.data.weight || '',
          address: data.data.address || '',
        });
        setStep('details');
      } else {
        alert('Patient not found. Please try again or register a new patient.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching patient:', error);
      setIsLoading(false);
      alert('Error searching for patient. Please try again or register a new patient.');
    }
  };

  // Create a new patient
  const createNewPatient = async () => {
    // Validate required fields
    if (!newPatient.name || !newPatient.phone) {
      alert('Name and Phone are required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Real API call to create a new patient
      const response = await fetch(`${API_BASE_URL}/patients/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPatient)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create patient');
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setPatient(data.data);
        setFormData({
          ...formData,
          name: data.data.name,
          phone: data.data.phone,
          email: data.data.email || '',
          age: data.data.age || '',
          weight: data.data.weight || '',
          address: data.data.address || '',
        });
        
        setShowNewPatientModal(false);
        setStep('details');
      } else {
        alert('Failed to create patient. Please try again.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating patient:', error);
      setIsLoading(false);
      alert('Error creating patient. Please try again.');
    }
  };

  // Check-in a patient
  const checkInPatient = async () => {
    if (!formData.reason) {
      alert('Please enter reason for visit');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Real API call to check-in the patient
      const response = await fetch(`${API_BASE_URL}/patients/${patient.patientId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          age: formData.age,
          weight: formData.weight,
          address: formData.address,
          reason: formData.reason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to check-in patient');
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setStep('payment');
      } else {
        alert('Failed to check-in patient. Please try again.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking in patient:', error);
      setIsLoading(false);
      alert('Error checking in patient. Please try again.');
    }
  };

  // Initiate payment
const initiatePayment = async () => {
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/hms/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId: patient.patientId,  // Use only patientId
        amount: parseFloat(formData.amount) // Ensure amount is a number
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initiate payment');
    }

    const data = await response.json();

    if (data.success) {
      setPaymentDetails(data.data);
      setPaymentStatus('pending');

      // Razorpay Integration
      openRazorpayCheckout(data.data); 
    } else {
      alert(data.message || 'Failed to initiate payment. Please try again.');
    }

  } catch (error) {
    console.error('Error initiating payment:', error.message);
    alert(error.message || 'Error initiating payment. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  // Simulate payment process (for demo purposes)
  const simulatePaymentProcess = () => {
    setPaymentStatus('processing');
    
    // Simulate payment completion after 3 seconds
    setTimeout(() => {
      // In a real app, this would be triggered by a webhook or confirmation from your payment gateway
      verifyPayment({ 
        paymentId: `pay_${Math.random().toString(36).substring(2, 15)}`,
        orderId: paymentDetails.orderId,
        signature: `sig_${Math.random().toString(36).substring(2, 15)}`
      });
    }, 3000);
  };

  // Reset and start over
  const handleNewCheckIn = () => {
    setSearchQuery('');
    setPatient(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      age: '',
      weight: '',
      address: '',
      reason: '',
      amount: ''
    });
    setNewPatient({
      name: '',
      phone: '',
      email: '',
      age: '',
      weight: '',
      address: ''
    });
    setPaymentDetails(null);
    setPaymentStatus('pending');
    setStep('search');
  };
  
  // In a real app, this would connect to Razorpay
  const openRazorpayCheckout = (paymentInfo) => {
    const options = {
      key: paymentInfo.key_id,
      amount: paymentInfo.amount * 100,
      currency: paymentInfo.currency,
      name: "Medical Clinic",
      description: "Patient Registration Fee",
      order_id: paymentInfo.orderId,
      handler: function (response) {
        // Handle successful payment
        verifyPayment(response);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: "#3B82F6"
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
  
  // Verify payment with your backend
  const verifyPayment = async (paymentResponse) => {
    try {
      // In a real app, send verification request to your backend
      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: paymentDetails.orderId,
          paymentId: paymentResponse.paymentId,
          signature: paymentResponse.signature
        })
      });
      
      if (!response.ok) {
        throw new Error('Payment verification failed');
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('failed');
    }
  };

  // Download invoice
  const downloadInvoice = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentDetails.orderId}/invoice`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }
      
      // Convert response to blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Invoice-${patient.patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice. Please try again.');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Patient Check-in System</h1>
        
        {/* Step 1: Search Patient */}
        {step === 'search' && (
          <div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Search Patient</label>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Patient ID, Name or Phone"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                  onClick={searchPatient}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                  Search
                </button>
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                  onClick={() => setShowNewPatientModal(true)}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  New Patient
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Patient Details */}
        {step === 'details' && patient && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                ID: {patient.patientId}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                <input 
                  id="name"
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
                <input 
                  id="phone"
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input 
                  id="email"
                  type="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Age</label>
                <input 
                  id="age"
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Weight (kg)</label>
                <input 
                  id="weight"
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Reason for Visit</label>
                <input 
                  id="reason"
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
              <textarea 
                id="address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center"
                onClick={checkInPatient}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                Check-in Patient
              </button>
              <button 
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                onClick={handleNewCheckIn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
              
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Patient Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Patient ID:</span>
                  <span className="font-medium">{patient?.patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Reason for Visit:</span>
                  <span className="font-medium">{formData.reason}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">Amount (₹)</label>
                <input 
                  id="amount"
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {!paymentDetails ? (
                <div className="flex gap-3">
                  <button 
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center"
                    onClick={initiatePayment}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <CreditCard className="w-5 h-5 mr-2" />}
                    Generate Payment QR
                  </button>
                  <button 
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                    onClick={() => setStep('details')}
                  >
                    Back
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-gray-100 p-6 rounded-lg mb-4 mx-auto max-w-xs">
                    {/* If your API returns a QR code URL, use it here */}
                    <div className="bg-white p-4 rounded border border-gray-300 mb-2">
                      {paymentDetails.qrCodeUrl ? (
                        <img src={paymentDetails.qrCodeUrl} alt="QR code" className="mx-auto" />
                      ) : (
                        <img src="/api/placeholder/200/200" alt="QR code" className="mx-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Scan using any UPI app (GPay, PhonePe, etc.)</p>
                  </div>
                  
                  {paymentStatus === 'pending' && (
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4">
                      Waiting for payment...
                    </div>
                  )}
                  
                  {paymentStatus === 'processing' && (
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 flex items-center justify-center">
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Processing payment...
                    </div>
                  )}
                  
                  {paymentStatus === 'success' && (
                    <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4 flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Payment successful! Invoice ready.
                    </div>
                  )}
                  
                  {paymentStatus === 'failed' && (
                    <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 flex items-center justify-center">
                      <X className="w-5 h-5 mr-2" />
                      Payment failed. Please try again.
                    </div>
                  )}
                  
                  {paymentStatus === 'success' && (
                    <div className="flex justify-center gap-3 mt-4">
                      <button 
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                        onClick={downloadInvoice}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Invoice
                      </button>
                      <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                        onClick={() => window.print()}
                      >
                        <Printer className="w-5 h-5 mr-2" />
                        Print Invoice
                      </button>
                    </div>
                  )}
                  
                  {paymentStatus === 'success' && (
                    <button 
                      className="mt-6 text-blue-500 hover:text-blue-700"
                      onClick={handleNewCheckIn}
                    >
                      Start new check-in
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">New Patient Registration</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
              <input 
                id="newName"
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPatient.name}
                onChange={handleNewPatientChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
              <input 
                id="newPhone"
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPatient.phone}
                onChange={handleNewPatientChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input 
                id="newEmail"
                type="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPatient.email}
                onChange={handleNewPatientChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Age</label>
                <input 
                  id="newAge"
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPatient.age}
                  onChange={handleNewPatientChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Weight (kg)</label>
                <input 
                  id="newWeight"
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPatient.weight}
                  onChange={handleNewPatientChange}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
              <textarea 
                id="newAddress"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                value={newPatient.address}
                onChange={handleNewPatientChange}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setShowNewPatientModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                onClick={createNewPatient}
                disabled={isLoading || !newPatient.name || !newPatient.phone}
              >
                {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <UserPlus className="w-5 h-5 mr-2" />}
                Save Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCheckInSystem;