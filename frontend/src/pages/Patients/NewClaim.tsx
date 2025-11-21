import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/shared/theme-provider";
import { ArrowLeft, Upload, X } from "lucide-react";
import { motion } from "framer-motion";

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
  "Other",
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
    documents: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message and redirect
      alert(
        "Claim submitted successfully! You will be redirected to the claims page."
      );
      navigate("/patients/claims");
    } catch (error) {
      alert("Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.amount &&
    formData.category &&
    formData.date &&
    formData.provider;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full min-h-screen flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-12 flex flex-col gap-8 transition-all duration-300"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/patients/claims")}
            className={`p-2 rounded-full transition-colors ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10"
            }`}
          >
            <ArrowLeft className="h-5 w-5 text-emerald-500" />
          </motion.button>
          <div>
            <h1
              className={`font-bold text-3xl sm:text-4xl ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              New Claim
            </h1>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Submit a new claim for medical expenses or eligible
              reimbursements.
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Claim Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`relative rounded-3xl overflow-hidden ${
              theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
            } backdrop-blur-xl border ${
              theme === "dark" ? "border-white/10" : "border-black/15"
            } p-6 sm:p-8`}
          >
            <div
              className={`absolute -top-40 -right-40 w-80 h-80 ${
                theme === "dark" ? "bg-emerald-500/10" : "bg-[#18E614]/30"
              } rounded-full blur-3xl`}
            />
            <div
              className={`absolute -bottom-40 -left-40 w-80 h-80 ${
                theme === "dark" ? "bg-blue-500/10" : "bg-blue-400/20"
              } rounded-full blur-3xl`}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative">
              <h2
                className={`font-bold text-lg mb-6 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Claim Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Claim Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Medical Consultation"
                    className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                        : "bg-black/[0.05] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                    }`}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white focus:border-emerald-500/50"
                        : "bg-black/[0.05] border border-black/10 text-gray-900 focus:border-emerald-500/50"
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    {claimCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Amount (₦) *
                  </label>
                  <Input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                        : "bg-black/[0.05] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                    }`}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Service Date *
                  </label>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white focus:border-emerald-500/50"
                        : "bg-black/[0.05] border border-black/10 text-gray-900 focus:border-emerald-500/50"
                    }`}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="md:col-span-2"
                >
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Healthcare Provider *
                  </label>
                  <Input
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    placeholder="e.g., City Hospital, Dr. Smith's Clinic"
                    className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                        : "bg-black/[0.05] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                    }`}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="md:col-span-2"
                >
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide details about the medical service or treatment..."
                    rows={4}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm transition-colors resize-none ${
                      theme === "dark"
                        ? "bg-white/[0.02] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50"
                        : "bg-black/[0.05] border border-black/10 text-gray-900 placeholder-gray-600 focus:border-emerald-500/50"
                    }`}
                    required
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Document Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`relative rounded-3xl overflow-hidden ${
              theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
            } backdrop-blur-xl border ${
              theme === "dark" ? "border-white/10" : "border-black/15"
            } p-6 sm:p-8`}
          >
            <div
              className={`absolute -top-40 -right-40 w-80 h-80 ${
                theme === "dark" ? "bg-blue-500/10" : "bg-blue-400/20"
              } rounded-full blur-3xl`}
            />
            <div
              className={`absolute -bottom-40 -left-40 w-80 h-80 ${
                theme === "dark" ? "bg-emerald-500/10" : "bg-[#18E614]/30"
              } rounded-full blur-3xl`}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative">
              <h2
                className={`font-bold text-lg mb-6 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Supporting Documents
              </h2>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ borderColor: "rgb(16, 185, 129)" }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/[0.02]"
                      : "border-black/20 hover:bg-black/[0.02]"
                  }`}
                >
                  <Upload
                    className={`h-8 w-8 mx-auto mb-3 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <p
                    className={`text-sm mb-3 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
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
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-2.5 bg-[#18E614]/40 text-white rounded-xl cursor-pointer font-semibold text-sm hover:shadow-lg hover:shadow-[#18E614]/20 transition-all"
                  >
                    Choose Files
                  </motion.label>
                  <p
                    className={`text-xs mt-3 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                  </p>
                </motion.div>

                {formData.documents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <h3
                      className={`font-semibold text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Uploaded Documents ({formData.documents.length})
                    </h3>
                    {formData.documents.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between rounded-lg p-3 ${
                          theme === "dark"
                            ? "bg-white/[0.02] border border-white/10"
                            : "bg-black/[0.04] border border-black/10"
                        }`}
                      >
                        <span
                          className={`text-sm truncate ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {file.name}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-600 p-1 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/patients/claims")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                theme === "dark"
                  ? "border-white/10 text-white hover:bg-white/[0.05]"
                  : "border-black/10 text-gray-900 hover:bg-black/[0.05]"
              }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: isFormValid && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid && !isSubmitting ? 0.98 : 1 }}
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all duration-300",
                isFormValid && !isSubmitting
                  ? "bg-[#18E614]/40 text-white shadow-lg hover:shadow-xl hover:shadow-[#18E614]/20"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Claim"
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewClaim;
