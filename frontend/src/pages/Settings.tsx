import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { Sun, Moon } from "lucide-react";

const Settings: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  // Get user data from localStorage
  const getUserData = () => {
    const userProfile = localStorage.getItem('userProfile');
    const userRole = localStorage.getItem('userRole');
    
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        accountType: userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : "User",
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
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    // Trigger custom event to update other components in same tab
    window.dispatchEvent(new Event('profileUpdated'));
    // Also trigger storage event for cross-tab updates
    window.dispatchEvent(new Event('storage'));
    alert('Profile updated successfully!');
  };

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center transition-colors duration-500 px-2 py-8 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <div className="relative w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-12 flex flex-col gap-10 transition-all duration-300">
        {/* Theme Toggle */}
        <button
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-100 dark:bg-gray-800 hover:bg-emerald-200 dark:hover:bg-gray-700 transition"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-gray-800" size={20} />}
        </button>
        <span className="font-extrabold text-2xl text-red-500 mb-2 block text-center tracking-wide">Settings</span>
        <div className="flex flex-col md:flex-row gap-10">
          {/* Profile Photo */}
          <div className="flex flex-col items-center w-full md:w-auto">
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-emerald-200 dark:border-white flex items-center justify-center cursor-pointer bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-gray-800 dark:to-gray-700 shadow-lg relative transition-all"
              onClick={handlePhotoClick}
              title="Click to change photo"
            >
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-black dark:text-white">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 5v14m7-7H5" />
                  </svg>
                  <span className="text-center text-xs font-semibold">Click to change photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoChange}
              />
            </div>
            <span className="mt-3 text-sm text-gray-500 dark:text-gray-400">Profile Photo</span>
          </div>
          {/* Account Details */}
          <div className="flex-1">
            <div className="mb-4">
              <span className="font-semibold text-lg text-black dark:text-white">Account Details</span>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSaveChanges}>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">First Name</label>
                <Input
                  className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Last Name</label>
                <Input
                  className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Email</label>
                <Input
                  className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Account Type</label>
                <Input
                  className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                  value={form.accountType}
                  disabled
                />
              </div>
              {form.phoneNumber && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Phone Number</label>
                  <Input
                    className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                    value={form.phoneNumber}
                    onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  />
                </div>
              )}
              {form.age && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Age</label>
                  <Input
                    className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  />
                </div>
              )}
              {form.specialization && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Specialization</label>
                  <Input
                    className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                    value={form.specialization}
                    onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                  />
                </div>
              )}
              {form.experience && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Years of Experience</label>
                  <Input
                    className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                    value={form.experience}
                    onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                  />
                </div>
              )}
              {form.licenseNumber && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">License Number</label>
                  <Input
                    className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                    value={form.licenseNumber}
                    onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                  />
                </div>
              )}
              <Button
                type="submit"
                className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-sm ${
                  theme === 'dark'
                    ? 'bg-transparent hover:bg-black hover:shadow-[0_2px_0_0_rgba(24,230,20,0.811)] hover:border-[#18E614]'
                    : 'bg-white text-black hover:bg-zinc-100 hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
                }`}
              >
                SAVE NEW CHANGES
              </Button>
            </form>
          </div>
        </div>

        {/* Additional Information Section */}
        {(form.bio || form.medicalHistory || form.currentMedications || form.therapyGoals || form.emergencyContact) && (
          <div className="mt-8">
            <span className="font-semibold text-lg text-black dark:text-white mb-2 block">Additional Information</span>
            <div className="flex flex-col gap-4">
              {form.bio && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 border border-emerald-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}
              {form.medicalHistory && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Medical History</label>
                  <textarea
                    className="w-full px-3 py-2 border border-emerald-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm resize-none"
                    rows={3}
                    value={form.medicalHistory}
                    onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))}
                    placeholder="Any relevant medical history..."
                  />
                </div>
              )}
              {form.currentMedications && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Current Medications</label>
                  <textarea
                    className="w-full px-3 py-2 border border-emerald-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm resize-none"
                    rows={3}
                    value={form.currentMedications}
                    onChange={e => setForm(f => ({ ...f, currentMedications: e.target.value }))}
                    placeholder="List any current medications..."
                  />
                </div>
              )}
              {form.therapyGoals && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Therapy Goals</label>
                  <textarea
                    className="w-full px-3 py-2 border border-emerald-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm resize-none"
                    rows={3}
                    value={form.therapyGoals}
                    onChange={e => setForm(f => ({ ...f, therapyGoals: e.target.value }))}
                    placeholder="What do you hope to achieve through therapy?"
                  />
                </div>
              )}
              {form.emergencyContact && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Emergency Contact</label>
                  <Input
                    className="rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-gray-700 text-black dark:text-white shadow-sm"
                    value={form.emergencyContact}
                    onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))}
                    placeholder="Emergency contact number"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;