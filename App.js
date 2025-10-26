import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, MapPin, User, Shield, Eye, FileText, Plus, Upload, X, Navigation, Search, Copy, Image, Camera, BarChart3 } from 'lucide-react';

const CityFixApp = () => {
  const [userId, setUserId] = useState(null);
  const [currentView, setCurrentView] = useState('citizen');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationText: '',
    photoUrl: '',
    coordinates: null
  });
  const [adminNotes, setAdminNotes] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [queryNumber, setQueryNumber] = useState('');
  const [searchedReport, setSearchedReport] = useState(null);
  const [generatedQueryNumber, setGeneratedQueryNumber] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [adminUploadImage, setAdminUploadImage] = useState({});
  const [cameraStream, setCameraStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');


  useEffect(() => {
    const storedUserId = localStorage.getItem('cityfix_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cityfix_user_id', newUserId);
      setUserId(newUserId);
    }
    
    const storedReports = localStorage.getItem('cityfix_reports');
    if (storedReports) {
      setReports(JSON.parse(storedReports));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem('cityfix_reports', JSON.stringify(reports));
    }
  }, [reports]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    const adminStatus = localStorage.getItem('cityfix_admin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const generateQueryNumber = () => {
    const prefix = 'CFC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > 500 * 1024) {
        reject(new Error('Image size should be less than 500KB'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error('Please upload an image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setFormData(prev => ({ ...prev, photoUrl: compressed }));
      showMessage('success', 'Image uploaded successfully!');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      setTimeout(() => {
        const videoElement = document.getElementById('camera-preview');
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Camera error:', error);
      showMessage('error', 'Unable to access camera. Please grant camera permission.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById('camera-preview');
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);

    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 600;
    let width = canvas.width;
    let height = canvas.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = width;
    resizedCanvas.height = height;
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(canvas, 0, 0, width, height);

    const photoDataUrl = resizedCanvas.toDataURL('image/jpeg', 0.7);
    setImagePreview(photoDataUrl);
    setFormData(prev => ({ ...prev, photoUrl: photoDataUrl }));
    
    stopCamera();
    showMessage('success', 'Photo captured successfully!');
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, photoUrl: '' }));
    if (cameraStream) {
      stopCamera();
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showMessage('error', 'Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    showMessage('success', 'Detecting your location...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          
          if (!response.ok) {
            throw new Error('Geocoding failed');
          }
          
          const data = await response.json();
          const address = data.display_name || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          
          setFormData(prev => ({ 
            ...prev, 
            locationText: address,
            coordinates: { latitude, longitude }
          }));
          
          showMessage('success', 'Location detected successfully!');
        } catch (error) {
          const coordsText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          setFormData(prev => ({ 
            ...prev, 
            locationText: coordsText,
            coordinates: { latitude, longitude }
          }));
          showMessage('success', 'Location coordinates captured!');
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
          case 1:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case 2:
            errorMessage = 'Location information unavailable. Please check your GPS/WiFi.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An error occurred while getting location.';
        }
        
        showMessage('error', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleSubmitReport = () => {
    if (!formData.title || !formData.description || !formData.locationText) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }

    const queryNum = generateQueryNumber();
    
    const newReport = {
      id: Date.now().toString(),
      queryNumber: queryNum,
      title: formData.title,
      description: formData.description,
      locationText: formData.locationText,
      photoUrl: formData.photoUrl || 'https://placehold.co/400x300/e0e0e0/555?text=No+Photo',
      reporterId: userId,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      adminNotes: '',
      resolvedImageUrl: null,
      coordinates: formData.coordinates
    };

    setReports(prev => [newReport, ...prev]);

    setFormData({
      title: '',
      description: '',
      locationText: '',
      photoUrl: '',
      coordinates: null
    });
    setImagePreview(null);

    setGeneratedQueryNumber(queryNum);
    setShowQueryModal(true);
    
    showMessage('success', 'Report submitted successfully!');
  };

  const handleUpdateStatus = (reportId, newStatus, notes = '') => {
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        const updateData = {
          ...report,
          status: newStatus,
          adminNotes: notes || report.adminNotes,
          timestamp: new Date().toISOString()
        };

        if (adminUploadImage[reportId]) {
          updateData.resolvedImageUrl = adminUploadImage[reportId];
          updateData.photoUrl = adminUploadImage[reportId];
        }

        return updateData;
      }
      return report;
    }));

    setAdminNotes(prev => ({ ...prev, [reportId]: '' }));
    setAdminUploadImage(prev => ({ ...prev, [reportId]: null }));
    showMessage('success', `Status updated to ${newStatus}`);
  };

  const handleAdminImageUpload = async (reportId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setAdminUploadImage(prev => ({ ...prev, [reportId]: compressed }));
      showMessage('success', 'Resolved image uploaded!');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
  setIsAdmin(true);
      setCurrentView('admin');
      localStorage.setItem('cityfix_admin', 'true');
      showMessage('success', 'Admin access granted!');
    } else {
      showMessage('error', 'Invalid password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('cityfix_admin');
    setCurrentView('citizen');
    showMessage('success', 'Logged out from admin panel');
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'Resolved': 'bg-green-100 text-green-800 border-green-300'
    };
    
    const icons = {
      'Pending': <Clock className="w-4 h-4" />,
      'In Progress': <AlertCircle className="w-4 h-4" />,
      'Resolved': <CheckCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || ''}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleSearchQuery = () => {
    if (!queryNumber.trim()) {
      showMessage('error', 'Please enter a query number');
      return;
    }

    const report = reports.find(r => r.queryNumber === queryNumber.trim().toUpperCase());
    
    if (report) {
      setSearchedReport(report);
      showMessage('success', 'Report found!');
    } else {
      setSearchedReport(null);
      showMessage('error', 'Query number not found. Please check and try again.');
    }
  };

  const clearSearch = () => {
    setQueryNumber('');
    setSearchedReport(null);
  };

  const copyQueryNumber = (qNum) => {
    navigator.clipboard.writeText(qNum);
    showMessage('success', 'Query number copied to clipboard!');
  };

  const getStatistics = () => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const inProgress = reports.filter(r => r.status === 'In Progress').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    const resolvedPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { total, pending, inProgress, resolved, resolvedPercentage };
  };

  const renderCitizenView = () => {
    const myReports = reports.filter(r => r.reporterId === userId);

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600" />
            Report a Civic Issue
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title *
              </label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" disabled>Select an issue title</option>
                <option value="Large Pothole on Main St">Large Pothole on Main Street</option>
                <option value="Street Light Not Working">Street Light Not Working</option>
                <option value="Yellow Spot">Yellow Spot (Public Urination Spot)</option>
                <option value="Overflow from Septic Tank">Overflow from Septic Tank</option>
                <option value="Overflow of Sewerage">Overflow of Sewerage</option>
                <option value="Dead Animal">Dead Animal</option>
                <option value="Dirty Dustbin">Dirty Dustbin</option>
                <option value="Garbage Dump">Garbage Dump</option>
                <option value="Dirty Street">Dirty Street</option>
                <option value="Dirty Public Toilet">Dirty Public Toilet</option>
                <option value="Damaged Park Bench">Damaged Park Bench</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capture/Upload Photo (Optional)
              </label>
              
              {!showCamera ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  {!imagePreview ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Open Camera
                      </button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {uploading ? 'Processing...' : 'Upload from gallery'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Max 500KB (auto-compressed)
                          </span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-blue-500 rounded-lg overflow-hidden">
                  <div className="relative bg-black">
                    <video
                      id="camera-preview"
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
                      >
                        <Camera className="w-5 h-5 inline mr-2" />
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700"
                      >
                        <X className="w-5 h-5 inline mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about the issue..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.locationText}
                  readOnly
                  placeholder="Click 'Get My Location' to detect"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {loadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Getting...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Get Location
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitReport}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Submit Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            My Submitted Reports ({myReports.length})
          </h2>
          
          {myReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't submitted any reports yet.</p>
          ) : (
            <div className="space-y-4">
              {myReports.map(report => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{report.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {report.queryNumber}
                        </span>
                        <button
                          onClick={() => copyQueryNumber(report.queryNumber)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy Query Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  {report.photoUrl && report.photoUrl !== 'https://placehold.co/400x300/e0e0e0/555?text=No+Photo' && (
                    <img 
                      src={report.photoUrl} 
                      alt={report.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <p className="text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {report.locationText}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted: {formatDate(report.timestamp)}
                  </p>
                  
                  {report.status === 'Resolved' && report.adminNotes && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-semibold text-green-900">Resolution Notes:</p>
                      <p className="text-sm text-green-800">{report.adminNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPublicView = () => {
    const resolvedReports = reports.filter(r => r.status === 'Resolved');
    const stats = getStatistics();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Track Your Complaint
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={queryNumber}
              onChange={(e) => setQueryNumber(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchQuery()}
              placeholder="Enter Query Number (e.g., CFC-123456-ABCD)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono"
            />
            <button
              onClick={handleSearchQuery}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Track
            </button>
            {searchedReport && (
              <button
                onClick={clearSearch}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-sm text-gray-600">
            💡 Tip: Find your Query Number in "My Submitted Reports" after filing a complaint.
          </p>

          {searchedReport && (
            <div className="mt-6 border-2 border-blue-300 rounded-lg p-5 bg-blue-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{searchedReport.title}</h3>
                  <span className="text-sm font-mono bg-blue-200 text-blue-900 px-3 py-1 rounded inline-block mt-1">
                    Query #: {searchedReport.queryNumber}
                  </span>
                </div>
                {getStatusBadge(searchedReport.status)}
              </div>

              {searchedReport.photoUrl && searchedReport.photoUrl !== 'https://placehold.co/400x300/e0e0e0/555?text=No+Photo' && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Issue Photo:</p>
                  <img 
                    src={searchedReport.photoUrl} 
                    alt={searchedReport.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Description:</p>
                  <p className="text-gray-700">{searchedReport.description}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{searchedReport.locationText}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Submitted:</p>
                    <p className="text-gray-600">{formatDate(searchedReport.timestamp)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Status:</p>
                    <p className="text-gray-800 font-medium">{searchedReport.status}</p>
                  </div>
                </div>

                {searchedReport.status === 'Resolved' && (
                  <div className="mt-3 p-4 bg-green-100 rounded border border-green-300">
                    <p className="text-sm font-semibold text-green-900 mb-2">✅ Issue Resolved!</p>
                    {searchedReport.adminNotes && (
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-green-900">Resolution Notes:</p>
                        <p className="text-sm text-green-800 mt-1">{searchedReport.adminNotes}</p>
                      </div>
                    )}
                    {searchedReport.resolvedImageUrl && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-green-900 mb-2">Proof of Resolution:</p>
                        <img 
                          src={searchedReport.resolvedImageUrl} 
                          alt="Resolved issue"
                          className="w-full h-64 object-cover rounded-lg border-2 border-green-400"
                        />
                      </div>
                    )}
                  </div>
                )}

                {searchedReport.status === 'In Progress' && (
                  <div className="mt-3 p-4 bg-blue-100 rounded border border-blue-300">
                    <p className="text-sm text-blue-800">
                      🔄 Your complaint is being processed. We'll update you once it's resolved.
                    </p>
                  </div>
                )}

                {searchedReport.status === 'Pending' && (
                  <div className="mt-3 p-4 bg-yellow-100 rounded border border-yellow-300">
                    <p className="text-sm text-yellow-800">
                      ⏳ Your complaint is pending review. Our team will look into it shortly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6 text-green-600" />
            Resolved Issues - Public Transparency
          </h2>
          
          {resolvedReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No resolved issues yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {resolvedReports.map(report => (
                <div key={report.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{report.title}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  {report.photoUrl && report.photoUrl !== 'https://placehold.co/400x300/e0e0e0/555?text=No+Photo' && (
                    <img 
                      src={report.photoUrl} 
                      alt={report.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <p className="text-gray-700 mb-2">{report.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    {report.locationText}
                  </div>
                  
                  {report.adminNotes && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-300">
                      <p className="text-sm font-medium text-gray-700">Resolution Notes:</p>
                      <p className="text-sm text-gray-600">{report.adminNotes}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Resolved: {formatDate(report.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    if (!isAdmin) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-600">Enter admin password to access the dashboard</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Login
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Demo password: admin123
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Admin Dashboard - All Reports ({reports.length})
          </h2>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{report.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {report.queryNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Reporter ID: {report.reporterId}</p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                
                {report.photoUrl && report.photoUrl !== 'https://placehold.co/400x300/e0e0e0/555?text=No+Photo' && (
                  <img 
                    src={report.photoUrl} 
                    alt={report.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}
                
                <p className="text-gray-700 mb-2">{report.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  {report.locationText}
                </div>
                
                <p className="text-xs text-gray-400 mb-4">
                  Submitted: {formatDate(report.timestamp)}
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-700 mb-2">Update Status:</p>
                  
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {report.status !== 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Pending')}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        → Pending
                      </button>
                    )}
                    {report.status !== 'In Progress' && (
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'In Progress')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        → In Progress
                      </button>
                    )}
                    {report.status !== 'Resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Resolved', adminNotes[report.id] || '')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        → Mark as Resolved
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes (for resolution):
                      </label>
                      <textarea
                        value={adminNotes[report.id] || report.adminNotes || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [report.id]: e.target.value })}
                        placeholder="Add notes about the resolution..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Proof of Resolution (Image):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id={`admin-upload-${report.id}`}
                          accept="image/*"
                          onChange={(e) => handleAdminImageUpload(report.id, e)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`admin-upload-${report.id}`}
                          className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center gap-2"
                        >
                          <Image className="w-4 h-4" />
                          {adminUploadImage[report.id] || report.resolvedImageUrl ? 'Change Image' : 'Upload Image'}
                        </label>
                        {(adminUploadImage[report.id] || report.resolvedImageUrl) && (
                          <span className="text-sm text-green-600">✓ Image attached</span>
                        )}
                      </div>
                      {(adminUploadImage[report.id] || report.resolvedImageUrl) && (
                        <div className="mt-2">
                          <img 
                            src={adminUploadImage[report.id] || report.resolvedImageUrl} 
                            alt="Resolution proof"
                            className="w-full h-48 object-cover rounded border-2 border-purple-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CityFix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">CityFix</h1>
              <p className="text-sm text-gray-600">Civic Issue Reporting Platform</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">ID: {userId?.substring(0, 12)}...</span>
            </div>
          </div>
          
          <nav className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentView('citizen')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'citizen'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Report Issue
            </button>
            <button
              onClick={() => setCurrentView('public')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'public'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Public Dashboard
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Admin Panel
            </button>
          </nav>
        </div>
      </header>

      {message.text && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {message.text}
          </div>
        </div>
      )}

      {showQueryModal && generatedQueryNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Report Submitted Successfully!
              </h2>
              
              <p className="text-gray-600 mb-4">
                Your complaint has been registered. Save this Query Number for tracking:
              </p>
              
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Query Number:</p>
                <p className="text-2xl font-bold font-mono text-blue-800 mb-3">
                  {generatedQueryNumber}
                </p>
                <button
                  onClick={() => copyQueryNumber(generatedQueryNumber)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Copy className="w-4 h-4" />
                  Copy Query Number
                </button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠ <strong>Important:</strong> Save this number! You'll need it to track your complaint in the Public Dashboard.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setShowQueryModal(false);
                  setGeneratedQueryNumber(null);
                }}
                className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'citizen' && renderCitizenView()}
        {currentView === 'public' && renderPublicView()}
        {currentView === 'admin' && renderAdminView()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>CityFix - Making our cities better, one report at a time.</p>
          <p className="mt-2 text-xs text-gray-500">Uses localStorage for data persistence</p>
        </div>
      </footer>
    </div>
  );
};

export default CityFixApp;