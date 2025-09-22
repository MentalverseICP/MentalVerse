import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/shared/theme-provider";
import { ArrowLeft, Upload, X } from "lucide-react";

interface ClaimFormData {
  title: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  provider: string;
  documents: File[];
}

const claimCategories = [
  "Medical Consultation",
  "Laboratory Tests",
  "Prescription Medication",
  "Hospital Treatment",
  "Therapy Session",
  "Emergency Care",
  "Dental Care",
  "Mental Health Services",
  "Other"
];

const NewClaim: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>({
    title: "",
    description: "",
    amount: "",
    category: "",
    date: "",
    provider: "",
    documents: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message and redirect
      alert("Claim submitted successfully! You will be redirected to the claims page.");
      navigate("/patients/claims");
    } catch (error) {
      alert("Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.amount && 
                     formData.category && formData.date && formData.provider;

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-12 mt-4 flex flex-col gap-8 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/patients/claims")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-extrabold text-2xl text-red-500 mb-2">
              New Claim
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Submit a new claim for medical expenses or eligible reimbursements.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-[#18E614] dark:border-gray-800 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 text-black dark:text-white">
              Claim Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Claim Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Medical Consultation"
                  className="rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 text-black dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {claimCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₦) *
                </label>
                <Input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Date *
                </label>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Healthcare Provider *
                </label>
                <Input
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  placeholder="e.g., City Hospital, Dr. Smith's Clinic"
                  className="rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide details about the medical service or treatment..."
                  rows={4}
                  className="w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-2 text-black dark:text-white resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-[#18E614] dark:border-gray-800 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 text-black dark:text-white">
              Supporting Documents
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload receipts, invoices, or medical reports
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-[#18E614] text-white rounded-lg cursor-pointer hover:bg-[#109326] transition-colors"
                >
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                </p>
              </div>
              
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Uploaded Documents ({formData.documents.length})
                  </h3>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/patients/claims")}
              className="flex-1 py-3 rounded-xl border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all duration-300",
                isFormValid && !isSubmitting
                  ? "bg-gradient-to-r from-[#6b9a41] to-[#18e614] hover:from-[#18e614] hover:to-[#109326] text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Claim"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClaim;