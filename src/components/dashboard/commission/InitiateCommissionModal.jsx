"use client";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const InitiateCommissionModal = ({ onClose, onSuccess }) => {
  const [targetMonth, setTargetMonth] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState({
    step1: "pending",
    step2: "pending",
    step3: "pending",
    step4: "pending"
  });

  const handleStepAction = async (step) => {
    if (step > currentStep) {
      toast.error(`Please complete step ${currentStep} first`);
      return;
    }

    if (!targetMonth && step > 1) {
      toast.error("Please select a target month first");
      return;
    }

    try {
      if (step === 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStepStatus(prev => ({ ...prev, step1: "completed" }));
        setCurrentStep(2);
        toast.success("Facility REC data confirmed successfully");
      } else if (step === 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStepStatus(prev => ({ ...prev, step2: "completed" }));
        setCurrentStep(3);
        toast.success("Facility commission remitted successfully");
      } else if (step === 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStepStatus(prev => ({ ...prev, step3: "completed" }));
        setCurrentStep(4);
        toast.success("Sales agent commission remitted successfully");
      } else if (step === 4) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStepStatus(prev => ({ ...prev, step4: "completed" }));
        toast.success("Dcarbon commission remitted successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(`Step ${step} failed: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-gray-300";
      default: return "bg-gray-300";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "pending": return "Pending";
      default: return "Pending";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">Initiate Commission Process</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Month (Required)</label>
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 px-3 text-sm"
            required
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(stepStatus.step1)}`}>
                1
              </div>
              <div>
                <h3 className="font-medium text-sm">Confirm Facility REC Data</h3>
                <p className="text-xs text-gray-500">Verify all facility REC data has been fetched for {targetMonth || "selected month"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded ${stepStatus.step1 === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {getStatusText(stepStatus.step1)}
              </span>
              <button
                onClick={() => handleStepAction(1)}
                className="bg-[#1E1E1E] text-white px-4 py-2 rounded text-sm hover:bg-[#333333] transition-colors"
              >
                Confirm REC Data
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(stepStatus.step2)}`}>
                2
              </div>
              <div>
                <h3 className="font-medium text-sm">Remit Facility Commission</h3>
                <p className="text-xs text-gray-500">Process facility commission payments for {targetMonth || "selected month"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded ${stepStatus.step2 === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {getStatusText(stepStatus.step2)}
              </span>
              <button
                onClick={() => handleStepAction(2)}
                disabled={stepStatus.step1 !== "completed"}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  stepStatus.step1 !== "completed" 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-[#1E1E1E] text-white hover:bg-[#333333]"
                }`}
              >
                Remit Facility
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(stepStatus.step3)}`}>
                3
              </div>
              <div>
                <h3 className="font-medium text-sm">Remit Sales Agent Commission</h3>
                <p className="text-xs text-gray-500">Process sales agent commission payments for {targetMonth || "selected month"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded ${stepStatus.step3 === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {getStatusText(stepStatus.step3)}
              </span>
              <button
                onClick={() => handleStepAction(3)}
                disabled={stepStatus.step2 !== "completed"}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  stepStatus.step2 !== "completed" 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-[#1E1E1E] text-white hover:bg-[#333333]"
                }`}
              >
                Remit Sales Agent
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(stepStatus.step4)}`}>
                4
              </div>
              <div>
                <h3 className="font-medium text-sm">Remit Dcarbon Commission</h3>
                <p className="text-xs text-gray-500">Process Dcarbon commission payments for {targetMonth || "selected month"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded ${stepStatus.step4 === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {getStatusText(stepStatus.step4)}
              </span>
              <button
                onClick={() => handleStepAction(4)}
                disabled={stepStatus.step3 !== "completed"}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  stepStatus.step3 !== "completed" 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-[#1E1E1E] text-white hover:bg-[#333333]"
                }`}
              >
                Remit Dcarbon
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitiateCommissionModal;