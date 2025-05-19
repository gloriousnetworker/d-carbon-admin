import React, { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const SignatureModal = ({ isOpen, onClose, onSaveSignature }) => {
  const [activeTab, setActiveTab] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [selectedFont, setSelectedFont] = useState("Signika");
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas when tab changes to draw
  useEffect(() => {
    if (activeTab === "draw" && isOpen) {
      initCanvas();
    }
  }, [activeTab, isOpen]);

  // Initialize canvas for drawing
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#039994";
    ctx.fillStyle = "#039994";
  };

  // Handle drawing start
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    setIsDrawing(true);
  };

  // Handle drawing
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.stroke();
  };

  // Handle drawing end
  const endDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);
    setSignatureData(canvas.toDataURL());
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

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
        const nextVal = Math.min(prev + 23, 100);
        if (nextVal >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
        }
        return nextVal;
      });
    }, 600);
  };

  const handleSignatureUpload = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    
    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    const formData = new FormData();
    let signatureMethod = "";

    try {
      if (activeTab === "draw") {
        if (!signatureData) {
          toast.error("Please draw your signature first");
          return;
        }
        // Convert data URL to blob
        const response = await fetch(signatureData);
        const blob = await response.blob();
        formData.append("signature", blob, "signature.png");
        signatureMethod = "drawn";
      } 
      else if (activeTab === "type") {
        if (!typedSignature.trim()) {
          toast.error("Please enter your signature text");
          return;
        }
        // Create a canvas with the typed signature
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 300;
        canvas.height = 100;
        ctx.font = `24px ${selectedFont}`;
        ctx.fillStyle = "#039994";
        ctx.fillText(typedSignature, 10, 50);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        formData.append("signature", blob, "signature.png");
        signatureMethod = "typed";
      } 
      else if (activeTab === "upload") {
        if (!selectedFile || !uploadComplete) {
          toast.error("Please upload a signature image first");
          return;
        }
        formData.append("signature", selectedFile);
        signatureMethod = "uploaded";
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/update-user-agreement/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(`Signature (${signatureMethod}) saved successfully`);
        onSaveSignature(signatureMethod);
        onClose();
      } else {
        toast.error(data.message || "Failed to save signature");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("An error occurred while saving the signature");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={spinnerOverlay}>
      <div className="relative w-full max-w-xl bg-white rounded-md shadow-md font-sfpro">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className={uploadHeading}>Upload Signature</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600"
            aria-label="Close"
          >
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
          {/* Draw */}
          {activeTab === "draw" && (
            <div className="space-y-4">
              <div 
                className="border border-gray-300 rounded-md h-64 bg-gray-50 relative"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
              >
                <canvas
                  ref={canvasRef}
                  width="100%"
                  height="100%"
                  className="absolute inset-0 w-full h-full"
                />
                {!signatureData && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Draw your signature here
                  </div>
                )}
              </div>
              <button
                onClick={clearCanvas}
                className="text-sm text-[#039994] hover:text-[#02857f]"
              >
                Clear Signature
              </button>
            </div>
          )}

          {/* Type */}
          {activeTab === "type" && (
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className={labelClass}>Select typeface</label>
                <select 
                  className={selectClass}
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                >
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
                <span 
                  className="text-2xl" 
                  style={{ 
                    fontFamily: selectedFont, 
                    color: "#039994",
                    whiteSpace: "nowrap"
                  }}
                >
                  {typedSignature || "Typed Signature Preview"}
                </span>
              </div>
            </div>
          )}

          {/* Upload */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {!uploadComplete ? (
                <>
                  {uploadProgress > 0 ? (
                    <div className="border-2 border-dashed border-[#039994] rounded-md p-4 flex flex-col items-center justify-center">
                      <p className="text-gray-600">Uploading...</p>
                      <div className="w-full bg-gray-200 h-2 rounded mt-2">
                        <div
                          className="bg-[#039994] h-2 rounded"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-sm mt-2 text-gray-500">
                        {selectedFile?.name} ({uploadProgress}%)
                      </div>
                    </div>
                  ) : (
                    <div className={fileInputWrapper}>
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-gray-500 mb-2">Drag & drop signature image</p>
                        <p className="text-gray-400 text-sm mb-4">or</p>
                        <button
                          onClick={handleSelectImage}
                          className={uploadButtonStyle}
                        >
                          Select image
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border-2 border-[#039994] rounded-md p-4 flex flex-col items-center justify-center bg-[#f5fdfd]">
                  <p className="font-medium text-[#039994] text-lg mb-2">
                    Signature uploaded
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div className="bg-[#039994] h-2 rounded w-full" />
                  </div>
                  <p className="text-sm mt-2 text-gray-600">
                    {selectedFile?.name} ✓
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanation Text */}
        <div className={termsTextContainer}>
          By uploading this signature, I acknowledge it will be used wherever a
          signature is required in my user profile.
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-4 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 font-sfpro"
          >
            Cancel
          </button>
          <button
            onClick={handleSignatureUpload}
            className={buttonPrimary}
          >
            Update Signature
          </button>
        </div>
      </div>
    </div>
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