import React, { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import LoginModal from "./LoginModal";

const SignatureModal = ({ isOpen, onClose, onSaveSignature }) => {
  const [activeTab, setActiveTab] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [selectedFont, setSelectedFont] = useState("Signika");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Get auth data from localStorage
  const getAuthData = () => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    return { authToken, userId };
  };

  useEffect(() => {
    if (activeTab === "draw" && isOpen) {
      initCanvas();
    }
  }, [activeTab, isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#039994";
    ctx.fillStyle = "#039994";
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);
    setSignatureData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSelectImage = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    setUploadComplete(false);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = Math.min(prev + 23, 100);
        if (next >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
        }
        return next;
      });
    }, 600);
  };

  const handleLoginSuccess = (user) => {
    setShowLoginModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleSignatureUpload = async () => {
    const { authToken, userId } = getAuthData();
    
    if (!authToken || !userId) {
      toast.error("Please log in to continue");
      setPendingAction(() => handleSignatureUpload);
      setShowLoginModal(true);
      return;
    }

    const formData = new FormData();
    let method = "";

    try {
      if (activeTab === "draw") {
        if (!signatureData) {
          toast.error("Draw your signature first");
          return;
        }
        const resp = await fetch(signatureData);
        const blob = await resp.blob();
        formData.append("signature", blob, "signature.png");
        method = "drawn";
      } else if (activeTab === "type") {
        if (!typedSignature.trim()) {
          toast.error("Enter signature text");
          return;
        }
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        c.width = 300;
        c.height = 100;
        ctx.font = `24px ${selectedFont}`;
        ctx.fillStyle = "#039994";
        ctx.fillText(typedSignature, 10, 50);
        const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
        formData.append("signature", blob, "signature.png");
        method = "typed";
      } else {
        if (!selectedFile || !uploadComplete) {
          toast.error("Upload a signature image first");
          return;
        }
        formData.append("signature", selectedFile);
        method = "uploaded";
      }

      // Add required agreement fields
      formData.append("termsAccepted", "true");
      formData.append("agreementCompleted", "true");

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/update-user-agreement/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save signature');
      }

      const result = await response.json();
      toast.success(`Signature (${method}) saved successfully`);
      onSaveSignature(result);
      onClose();
    } catch (error) {
      console.error("Signature upload error:", error);
      toast.error(error.message || 'Error saving signature');
      
      if (error.message.includes('Unauthorized') || error.message.includes('expired')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setPendingAction(() => handleSignatureUpload);
        setShowLoginModal(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={spinnerOverlay}>
        <div className="relative w-full max-w-xl bg-white rounded-md shadow-md font-sfpro">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className={uploadHeading}>Upload Signature</h2>
            <button onClick={onClose} className="text-red-500 hover:text-red-600" aria-label="Close">
              <FaTimes size={20} />
            </button>
          </div>
          {/* Tabs */}
          <div className="px-6">
            <ul className="flex space-x-6 border-b border-gray-200">
              {["draw", "type", "upload"].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 transition-colors text-sm ${
                      activeTab === tab
                        ? "text-[#039994] border-b-2 border-[#039994]"
                        : "text-gray-500 hover:text-gray-600"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Content */}
          <div className="px-6 py-4 min-h-[250px]">
            {activeTab === "draw" && (
              <div className="space-y-4">
                <div
                  className="border border-gray-300 rounded-md h-64 bg-gray-50 relative"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                >
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                  {!signatureData && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Draw your signature here
                    </div>
                  )}
                </div>
                <button onClick={clearCanvas} className="text-sm text-[#039994] hover:text-[#02857f]">Clear Signature</button>
              </div>
            )}

            {activeTab === "type" && (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Select typeface</label>
                  <select className={selectClass} value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
                    <option value="Signika">Signika</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Dancing Script">Dancing Script</option>
                  </select>
                  <label className={labelClass}>Enter Name</label>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    className={inputClass}
                    placeholder="Your Name"
                  />
                </div>
                <div className="border border-gray-300 rounded-md h-24 flex items-center justify-center bg-gray-50">
                  <span className="text-2xl" style={{ fontFamily: selectedFont, color: "#039994", whiteSpace: "nowrap" }}>
                    {typedSignature || "Typed Signature Preview"}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="space-y-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                {!uploadComplete ? (
                  uploadProgress > 0 ? (
                    <div className="border-2 border-dashed border-[#039994] rounded-md p-4 flex flex-col items-center justify-center">
                      <p className="text-gray-600">Uploading...</p>
                      <div className="w-full bg-gray-200 h-2 rounded mt-2">
                        <div className="bg-[#039994] h-2 rounded" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <div className="text-sm mt-2 text-gray-500">
                        {selectedFile?.name} ({uploadProgress}%)
                      </div>
                    </div>
                  ) : (
                    <div className={fileInputWrapper} onClick={handleSelectImage}>
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-gray-500 mb-2">Drag & drop signature image</p>
                        <p className="text-gray-400 text-sm mb-4">or</p>
                        <button className={uploadButtonStyle}>Select image</button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="border-2 border-[#039994] rounded-md p-4 flex flex-col items-center justify-center bg-[#f5fdfd]">
                    <p className="font-medium text-[#039994] text-lg mb-2">Signature uploaded</p>
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div className="bg-[#039994] h-2 rounded w-full" />
                    </div>
                    <p className="text-sm mt-2 text-gray-600">{selectedFile?.name} ✓</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={termsTextContainer}>
            By uploading this signature, I acknowledge it will be used wherever a signature is required in my user profile.
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex justify-end space-x-4 px-6 pb-6">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 font-sfpro">
              Cancel
            </button>
            <button onClick={handleSignatureUpload} className={buttonPrimary}>
              Update Signature
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

// Style constants
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const fileInputWrapper = 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro';
const uploadButtonStyle = 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
const buttonPrimary = 'px-4 py-2 rounded-md bg-[#039994] text-white hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
const termsTextContainer = 'px-6 text-sm text-gray-600 font-sfpro text-center mb-4';
const uploadHeading = 'text-xl font-semibold text-[#039994] font-sfpro';

export default SignatureModal;