import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";

const Settings: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dummy state for form fields
  const [form, setForm] = React.useState({
    firstName: "Ola",
    lastName: "Boluwatife",
    email: "Olaboluwatofezzy@ymail.com",
    accountType: "Patient",
    photo: "",
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // For demo, just show the file name or preview
      setForm((prev) => ({
        ...prev,
        photo: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  return (
    <div
      className={cn(
        "p-5 md:p-10 w-full min-h-screen flex flex-col items-center",
        isCollapsed ? "md:w-[90vw]" : "md:w-[80vw]"
      )}
    >
      <div className="w-full max-w-4xl bg-black dark:bg-white/5 rounded-2xl border border-gray-700 dark:border-gray-200 p-6 md:p-12 mt-4">
        <span className="font-bold text-lg text-red-500 mb-6 block">Settings</span>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div
              className="w-40 h-40 rounded-full border-4 border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer bg-gray-800 dark:bg-gray-700 relative"
              onClick={handlePhotoClick}
            >
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 5v14m7-7H5" />
                  </svg>
                  <span className="text-center text-sm">Click to change photo</span>
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
          </div>
          {/* Account Details */}
          <div className="flex-1">
            <div className="mb-6">
              <span className="font-semibold text-white dark:text-white text-lg">Account Details</span>
            </div>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-white dark:text-white mb-1">First Name</label>
                <Input
                  className="rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-white dark:text-white mb-1">Last Name</label>
                <Input
                  className="rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-white dark:text-white mb-1">Email</label>
                <Input
                  className="rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-white dark:text-white mb-1">Account Type</label>
                <Input
                  className="rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
                  value={form.accountType}
                  disabled
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-6 rounded-full bg-green-500 text-white font-bold py-3 text-lg"
              >
                SAVE NEW CHANGES
              </Button>
            </form>
          </div>
        </div>
      </div>
      {/* Security section can go here */}
    </div>
  );
};

export default Settings;