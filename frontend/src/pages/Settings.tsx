import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { Sun, Moon, Camera, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Settings: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getUserData = () => {
    const userProfile = localStorage.getItem("userProfile");
    const userRole = localStorage.getItem("userRole");

    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        accountType: userRole
          ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
          : "User",
        phoneNumber: profile.phoneNumber || "",
        specialization: profile.specialization || "",
        experience: profile.experience || "",
        licenseNumber: profile.licenseNumber || "",
        bio: profile.bio || "",
        age: profile.age || "",
        emergencyContact: profile.emergencyContact || "",
        medicalHistory: profile.medicalHistory || "",
        currentMedications: profile.currentMedications || "",
        therapyGoals: profile.therapyGoals || "",
        photo: profile.photo || "",
      };
    }

    // Fallback data
    return {
      firstName: "Ola",
      lastName: "Boluwatife",
      email: "Olaboluwatofezzy@ymail.com",
      accountType: "Patient",
      phoneNumber: "",
      specialization: "",
      experience: "",
      licenseNumber: "",
      bio: "",
      age: "",
      emergencyContact: "",
      medicalHistory: "",
      currentMedications: "",
      therapyGoals: "",
      photo: "",
    };
  };

  const [form, setForm] = React.useState(getUserData());

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Update localStorage with new profile data
    const updatedProfile = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      specialization: form.specialization,
      experience: form.experience,
      licenseNumber: form.licenseNumber,
      bio: form.bio,
      age: form.age,
      emergencyContact: form.emergencyContact,
      medicalHistory: form.medicalHistory,
      currentMedications: form.currentMedications,
      therapyGoals: form.therapyGoals,
      photo: form.photo,
    };

    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    window.dispatchEvent(new Event("profileUpdated"));
    window.dispatchEvent(new Event("storage"));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

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
      <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-8 transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1
              className={`text-3xl sm:text-4xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Settings
            </h1>
            <p
              className={`text-sm mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage your profile and preferences
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-3 rounded-xl transition-all ${
              theme === "dark"
                ? "bg-white/10 hover:bg-white/20 border border-white/20"
                : "bg-black/10 hover:bg-black/20 border border-black/10"
            }`}
          >
            {theme === "dark" ? (
              <Sun size={24} className="text-yellow-400" />
            ) : (
              <Moon size={24} className="text-gray-800" />
            )}
          </motion.button>
        </motion.div>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#18E614]/10 border border-[#18E614]/30 text-[#12B80E]"
          >
            <Check size={18} />
            <span className="text-sm font-medium">
              Profile updated successfully!
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative rounded-3xl overflow-hidden ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-xl border ${
            theme === "dark" ? "border-white/10" : "border-black/15"
          }`}
        >
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 ${
              theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
            } rounded-full blur-3xl`}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center lg:items-start"
              >
                <div
                  onClick={handlePhotoClick}
                  className={`group relative w-40 h-40 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-[#18E614]/15 to-[#18E614]/8 border border-[#18E614]/25 hover:border-[#18E614]/50"
                      : "bg-gradient-to-br from-[#18E614]/10 to-[#18E614]/5 border border-[#18E614]/30 hover:border-[#18E614]/60"
                  }`}
                >
                  {form.photo ? (
                    <img
                      src={form.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Camera
                        className={`w-8 h-8 mb-2 ${
                          theme === "dark"
                            ? "text-emerald-400"
                            : "text-emerald-600"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold text-center ${
                          theme === "dark"
                            ? "text-emerald-300"
                            : "text-emerald-700"
                        }`}
                      >
                        Upload Photo
                      </span>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center`}
                  >
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
              >
                <h3
                  className={`text-lg font-bold mb-6 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Account Information
                </h3>
                <form
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  onSubmit={handleSaveChanges}
                >
                  <div>
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      First Name
                    </label>
                    <Input
                      className={`rounded-xl ${
                        theme === "dark"
                          ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                          : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                      } shadow-sm transition-all focus:border-emerald-500`}
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, firstName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Last Name
                    </label>
                    <Input
                      className={`rounded-xl ${
                        theme === "dark"
                          ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                          : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                      } shadow-sm transition-all focus:border-emerald-500`}
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lastName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email
                    </label>
                    <Input
                      className={`rounded-xl ${
                        theme === "dark"
                          ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                          : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                      } shadow-sm transition-all focus:border-emerald-500`}
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Account Type
                    </label>
                    <div
                      className={`px-4 py-2.5 rounded-xl ${
                        theme === "dark"
                          ? "bg-white/5 border border-white/20 text-gray-400"
                          : "bg-black/5 border border-black/10 text-gray-600"
                      }`}
                    >
                      {form.accountType}
                    </div>
                  </div>
                  {form.phoneNumber && (
                    <div>
                      <label
                        className={`block mb-2 font-medium text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number
                      </label>
                      <Input
                        className={`rounded-xl ${
                          theme === "dark"
                            ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                            : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                        } shadow-sm transition-all focus:border-emerald-500`}
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            phoneNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                  {form.age && (
                    <div>
                      <label
                        className={`block mb-2 font-medium text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Age
                      </label>
                      <Input
                        className={`rounded-xl ${
                          theme === "dark"
                            ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                            : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                        } shadow-sm transition-all focus:border-emerald-500`}
                        value={form.age}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, age: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  {form.specialization && (
                    <div>
                      <label
                        className={`block mb-2 font-medium text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Specialization
                      </label>
                      <Input
                        className={`rounded-xl ${
                          theme === "dark"
                            ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                            : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                        } shadow-sm transition-all focus:border-emerald-500`}
                        value={form.specialization}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            specialization: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                  {form.experience && (
                    <div>
                      <label
                        className={`block mb-2 font-medium text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Years of Experience
                      </label>
                      <Input
                        className={`rounded-xl ${
                          theme === "dark"
                            ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                            : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                        } shadow-sm transition-all focus:border-emerald-500`}
                        value={form.experience}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, experience: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  {form.licenseNumber && (
                    <div>
                      <label
                        className={`block mb-2 font-medium text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        License Number
                      </label>
                      <Input
                        className={`rounded-xl ${
                          theme === "dark"
                            ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                            : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                        } shadow-sm transition-all focus:border-emerald-500`}
                        value={form.licenseNumber}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            licenseNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="sm:col-span-2 px-6 py-3 rounded-xl font-bold bg-[#18E614]/40 text-white hover:shadow-lg hover:shadow-[#18E614]/20 transition-all"
                  >
                    Save Changes
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {(form.bio ||
          form.medicalHistory ||
          form.currentMedications ||
          form.therapyGoals ||
          form.emergencyContact) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`relative rounded-3xl overflow-hidden ${
              theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
            } backdrop-blur-xl border border-white/10`}
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative p-6 sm:p-8 md:p-10">
              <h3
                className={`text-lg font-bold mb-6 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.bio && (
                  <div className="md:col-span-2">
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Bio
                    </label>
                    <textarea
                      className={`w-full px-4 py-3 border rounded-xl bg-transparent text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark"
                          ? "border-white/20 text-white placeholder-gray-500"
                          : "border-black/10 text-gray-900 placeholder-gray-600"
                      }`}
                      rows={3}
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                )}
                {form.medicalHistory && (
                  <div className="md:col-span-2">
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Medical History
                    </label>
                    <textarea
                      className={`w-full px-4 py-3 border rounded-xl bg-transparent text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark"
                          ? "border-white/20 text-white placeholder-gray-500"
                          : "border-black/10 text-gray-900 placeholder-gray-600"
                      }`}
                      rows={3}
                      value={form.medicalHistory}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          medicalHistory: e.target.value,
                        }))
                      }
                      placeholder="Any relevant medical history..."
                    />
                  </div>
                )}
                {form.currentMedications && (
                  <div>
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Current Medications
                    </label>
                    <textarea
                      className={`w-full px-4 py-3 border rounded-xl bg-transparent text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark"
                          ? "border-white/20 text-white placeholder-gray-500"
                          : "border-black/10 text-gray-900 placeholder-gray-600"
                      }`}
                      rows={3}
                      value={form.currentMedications}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          currentMedications: e.target.value,
                        }))
                      }
                      placeholder="List any current medications..."
                    />
                  </div>
                )}
                {form.therapyGoals && (
                  <div>
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Therapy Goals
                    </label>
                    <textarea
                      className={`w-full px-4 py-3 border rounded-xl bg-transparent text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark"
                          ? "border-white/20 text-white placeholder-gray-500"
                          : "border-black/10 text-gray-900 placeholder-gray-600"
                      }`}
                      rows={3}
                      value={form.therapyGoals}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, therapyGoals: e.target.value }))
                      }
                      placeholder="What do you hope to achieve through therapy?"
                    />
                  </div>
                )}
                {form.emergencyContact && (
                  <div>
                    <label
                      className={`block mb-2 font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Emergency Contact
                    </label>
                    <Input
                      className={`rounded-xl ${
                        theme === "dark"
                          ? "bg-white/10 border border-white/20 text-white placeholder-gray-500"
                          : "bg-white/50 border border-black/10 text-black placeholder-gray-600"
                      } shadow-sm transition-all focus:border-emerald-500`}
                      value={form.emergencyContact}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          emergencyContact: e.target.value,
                        }))
                      }
                      placeholder="Emergency contact number"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;
