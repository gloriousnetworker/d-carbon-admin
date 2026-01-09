import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm',
  modal: 'relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden',
  modalHeader: 'px-8 pt-8 pb-6 bg-gradient-to-br from-[#039994] to-[#02857f]',
  modalTitle: 'font-[600] text-[28px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-2',
  modalSubtitle: 'text-[15px] text-white text-opacity-90 leading-relaxed',
  closeButton: 'absolute top-6 right-6 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 cursor-pointer transition-all',
  modalBody: 'px-8 py-6',
  buttonPrimary: 'w-full rounded-lg bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sfpro transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  buttonSecondary: 'w-full rounded-lg border-2 border-[#039994] text-[#039994] font-semibold py-3 hover:bg-[#039994] hover:bg-opacity-5 focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sfpro transition-all',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[500] text-[#1E1E1E]',
  inputClass: 'w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[400] text-[#1E1E1E] transition-all',
  selectClass: 'w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[400] text-[#1E1E1E] transition-all appearance-none bg-white',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[140%] tracking-[-0.03em] font-[400] text-gray-500',
  spinner: 'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin',
  divider: 'my-6 border-t border-gray-200',
  infoBox: 'flex items-start gap-3 p-4 bg-[#039994] bg-opacity-5 border-l-4 border-[#039994] rounded-r-lg',
  infoIcon: 'flex-shrink-0 w-5 h-5 text-[#039994] mt-0.5',
  toggleContainer: 'flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4',
  toggleLabel: 'text-[14px] font-[500] text-gray-700',
  toggleButton: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2',
  toggleButtonEnabled: 'bg-[#039994]',
  toggleButtonDisabled: 'bg-gray-300',
  toggleCircle: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
  toggleCircleEnabled: 'translate-x-6',
  toggleCircleDisabled: 'translate-x-1',
  selectWrapper: 'relative',
  selectArrow: 'pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
};

export default function InstapullAuthorizationModal({ isOpen, onClose, utilityProvider, instapullOpened, openInstapullTab, userId, authorizationData, isAdminReinitiate }) {
  const [submitting, setSubmitting] = useState(false);
  const [checkingMeters, setCheckingMeters] = useState(false);
  const [sameEmail, setSameEmail] = useState(true);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    userType: "COMMERCIAL",
    utilityType: "",
    authorizationEmail: ""
  });

  const fetchUtilityProviders = async () => {
    setLoadingProviders(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");

      const response = await axios.get(
        'https://services.dcarbon.solutions/api/auth/utility-providers?page=1&limit=100',
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setUtilityProviders(response.data.data.utilityProviders || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch utility providers");
      }
    } catch (err) {
      toast.error('Failed to load utility providers');
      console.error("Error fetching utility providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
      
      if (isAdminReinitiate && authorizationData) {
        setFormData({
          email: authorizationData.email || "",
          userType: authorizationData.userType || "COMMERCIAL",
          utilityType: authorizationData.utilityType || utilityProvider || "",
          authorizationEmail: authorizationData.authorizationEmail || authorizationData.email || ""
        });
        setSameEmail(authorizationData.email === authorizationData.authorizationEmail);
      } else {
        const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
        const userEmail = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail || '';
        setFormData(prev => ({
          ...prev,
          email: userEmail,
          authorizationEmail: userEmail,
          utilityType: utilityProvider || ""
        }));
        setSameEmail(true);
      }
    }
  }, [isOpen, utilityProvider, authorizationData, isAdminReinitiate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = () => {
    const newSameEmail = !sameEmail;
    setSameEmail(newSameEmail);
    
    if (newSameEmail) {
      setFormData(prev => ({ 
        ...prev, 
        authorizationEmail: prev.email 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        authorizationEmail: "" 
      }));
    }
  };

  const checkMeterStatus = async () => {
    if (!userId) return;
    
    setCheckingMeters(true);
    try {
      const authToken = localStorage.getItem("authToken");
      
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/auth/utility-auth/${userId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${authToken}`
          } 
        }
      );
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        const authData = response.data.data[0];
        
        if (authData.hasMeter) {
          toast.success('Meters fetched successfully! You can now add them to your facilities.', {
            duration: 5000,
            icon: '✓'
          });
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 1500);
        } else {
          toast.loading('Meters are being fetched. This takes 3-5 minutes.', {
            duration: 4000,
            icon: '⏳'
          });
        }
      }
    } catch (err) {
      toast.error('Failed to check meter status. Please try again.');
    } finally {
      setCheckingMeters(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!formData.utilityType.trim()) {
      toast.error('Utility provider is required');
      return;
    }

    if (!sameEmail && !formData.authorizationEmail.trim()) {
      toast.error('Authorization email is required');
      return;
    }

    setSubmitting(true);
    
    try {
      const authToken = localStorage.getItem("authToken");

      const payload = {
        email: formData.email.trim(),
        userType: formData.userType,
        utilityType: formData.utilityType,
        authorizationEmail: sameEmail ? formData.email.trim() : formData.authorizationEmail.trim()
      };

      const response = await axios.post(
        'https://services.dcarbon.solutions/api/utility-auth/green-button',
        payload,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          } 
        }
      );

      toast.success(response.data.message || 'Authorization submitted successfully!', {
        duration: 4000,
        icon: '✓'
      });
      
      setSubmitting(false);
      onClose();
      
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit authorization');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalContainer} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className={styles.closeButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Utility Authorization</h2>
          <p className={styles.modalSubtitle}>
            {instapullOpened 
              ? 'Complete your authorization in the Instapull tab, then return here to submit your details.'
              : 'Click the button below to open Instapull and complete your authorization.'}
          </p>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.toggleContainer}>
            <span className={styles.toggleLabel}>Is your account email the same as your authorization email?</span>
            <button
              type="button"
              className={`${styles.toggleButton} ${sameEmail ? styles.toggleButtonEnabled : styles.toggleButtonDisabled}`}
              onClick={handleToggleChange}
              aria-pressed={sameEmail}
            >
              <span className={`${styles.toggleCircle} ${sameEmail ? styles.toggleCircleEnabled : styles.toggleCircleDisabled}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={styles.labelClass}>
                Your Email <span className="text-[#039994]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.inputClass}
                placeholder="your.email@company.com"
                required
              />
            </div>

            <div>
              <label className={styles.labelClass}>
                User Type <span className="text-[#039994]">*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className={styles.selectClass}
                  required
                >
                  <option value="COMMERCIAL">COMMERCIAL</option>
                  <option value="RESIDENTIAL">RESIDENTIAL</option>
                </select>
                <div className={styles.selectArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className={styles.labelClass}>
                Utility Provider <span className="text-[#039994]">*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  name="utilityType"
                  value={formData.utilityType}
                  onChange={handleInputChange}
                  className={styles.selectClass}
                  required
                  disabled={loadingProviders}
                >
                  <option value="">{loadingProviders ? 'Loading providers...' : 'Select utility provider'}</option>
                  {utilityProviders.map((provider) => (
                    <option key={provider.id} value={provider.name}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                <div className={styles.selectArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {!sameEmail && (
              <div>
                <label className={styles.labelClass}>
                  Authorization Email <span className="text-[#039994]">*</span>
                </label>
                <input
                  type="email"
                  name="authorizationEmail"
                  value={formData.authorizationEmail}
                  onChange={handleInputChange}
                  className={styles.inputClass}
                  placeholder="auth.email@company.com"
                  required
                />
                <p className={styles.noteText}>Required for Green Button authorization</p>
              </div>
            )}
          </div>

          <div className={styles.divider}></div>

          {!instapullOpened && (
            <div className={styles.infoBox}>
              <svg className={styles.infoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[14px] font-[500] text-[#039994] mb-1">Action Required</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">Open Instapull to authorize access to your utility data before submitting this form.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              onClick={openInstapullTab}
              className={styles.buttonSecondary}
            >
              {instapullOpened ? 'Reinitiate Authorization' : 'Open Instapull'}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || checkingMeters || (!sameEmail && !formData.authorizationEmail.trim()) || !formData.utilityType}
              className={styles.buttonPrimary}
            >
              {submitting || checkingMeters ? (
                <span className="flex items-center justify-center gap-2">
                  <div className={styles.spinner}></div>
                  <span>{checkingMeters ? 'Checking Status...' : 'Processing...'}</span>
                </span>
              ) : (
                'Confirm Authorization'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}