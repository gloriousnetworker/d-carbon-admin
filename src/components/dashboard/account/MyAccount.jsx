"use client";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const TwoFactorAuth = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E8E8E8]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
            <Button variant="outline" onClick={onBack}>
              Back to Account
            </Button>
          </div>
          <div className="space-y-4">
            <p>Set up 2FA using an authenticator app like Google Authenticator.</p>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="font-medium mb-2">Scan this QR code:</p>
              <div className="w-40 h-40 bg-white border border-gray-300 flex items-center justify-center mb-4">
                <span className="text-gray-500">QR Code Placeholder</span>
              </div>
              <p className="text-sm text-gray-600">Or enter this code manually: XK34-9B2Q</p>
            </div>
            <div>
              <Label>Verification Code</Label>
              <Input placeholder="Enter 6-digit code" className="mt-1" />
            </div>
            <Button>Enable 2FA</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Change Password</span>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button>Change Password</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProfileImage = ({ userData, onUploadSuccess }) => {
  return (
    <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {userData.profileImage ? (
          <img 
            src={userData.profileImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl text-gray-500">
            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
          </span>
        )}
      </div>
      <Button variant="outline" size="sm">
        Change Photo
      </Button>
    </div>
  );
};

const ContactInformation = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#039994]">Contact Information</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          {isEditing ? (
            <Input defaultValue={userData.firstName} />
          ) : (
            <p>{userData.firstName}</p>
          )}
        </div>
        <div>
          <Label>Last Name</Label>
          {isEditing ? (
            <Input defaultValue={userData.lastName} />
          ) : (
            <p>{userData.lastName}</p>
          )}
        </div>
        <div>
          <Label>Email</Label>
          {isEditing ? (
            <Input defaultValue={userData.email} type="email" />
          ) : (
            <p>{userData.email}</p>
          )}
        </div>
        <div>
          <Label>Phone</Label>
          {isEditing ? (
            <Input defaultValue={userData.phone} />
          ) : (
            <p>{userData.phone}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <Label>Address</Label>
          {isEditing ? (
            <Input defaultValue={userData.address} />
          ) : (
            <p>{userData.address}</p>
          )}
        </div>
      </div>
      
      {isEditing && (
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      )}
    </div>
  );
};

const MyAccount = () => {
  const [showPreferences, setShowPreferences] = useState(true);
  const [viewTwoFA, setViewTwoFA] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    company: "ACME Inc.",
    position: "Senior Manager",
    address: "123 Main St, Anytown, USA",
    profileImage: ""
  };

  if (viewTwoFA) {
    return <TwoFactorAuth onBack={() => setViewTwoFA(false)} />;
  }

  return (
    <>
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row border border-[#E8E8E8]">
            <ProfileImage userData={userData} />
            
            <div className="w-full md:w-2/3 md:pl-8 space-y-6">
              <ContactInformation userData={userData} />
              
              <div className="border-t border-[#E8E8E8] pt-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPreferences(!showPreferences)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">Preferences</h2>
                  {showPreferences ? (
                    <FaChevronUp className="text-[#039994]" size={20} />
                  ) : (
                    <FaChevronDown className="text-[#039994]" size={20} />
                  )}
                </div>
                
                {showPreferences && (
                  <div className="mt-4 space-y-4">
                    <button
                      className="text-sm text-[#1E1E1E] hover:text-[#039994] focus:outline-none block transition-colors"
                      onClick={() => setViewTwoFA(true)}
                    >
                      2FA Authentication
                    </button>
                    <button
                      className="text-sm text-[#1E1E1E] hover:text-[#039994] focus:outline-none block transition-colors"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;