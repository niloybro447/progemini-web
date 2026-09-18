"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaIdCard, FaTimes, FaArrowRight, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";

interface StudentWelcomeBannerProps {
  initialProfile?: any;
}

export default function StudentWelcomeBanner({ initialProfile }: StudentWelcomeBannerProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(!initialProfile);

  useEffect(() => {
    // Check session storage if dismissed
    const isDismissed = sessionStorage.getItem("progemini_welcome_banner_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }

    if (!initialProfile) {
      apiClient
        .get<any>("/v1/student/profile")
        .then((res) => {
          if (res?.profile) {
            setProfile(res.profile);
          } else if (res?.id) {
            setProfile(res);
          }
        })
        .catch(() => {
          // silently handle
        })
        .finally(() => setLoading(false));
    }
  }, [initialProfile, pathname]);

  if (dismissed || loading) return null;

  const sp = profile?.studentProfile;
  const isCompleted = sp?.isCompleted;

  if (isCompleted) return null;

  // Calculate missing required fields
  const requiredChecks = [
    { label: "Name", done: Boolean(profile?.name?.trim()) },
    { label: "Phone", done: Boolean(profile?.phone?.trim()) },
    { label: "Passport", done: Boolean(sp?.passport?.trim()) },
    { label: "Nationality", done: Boolean(sp?.nationality?.trim()) },
    { label: "Address", done: Boolean(sp?.address?.trim() || profile?.address?.trim()) },
    { label: "Profile Photo", done: Boolean(profile?.avatar) },
  ];

  const completedCount = requiredChecks.filter((c) => c.done).length;
  const totalCount = requiredChecks.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  const missingLabels = requiredChecks.filter((c) => !c.done).map((c) => c.label);

  const handleDismiss = () => {
    sessionStorage.setItem("progemini_welcome_banner_dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-red-700 via-brand-primary to-red-600 text-white shadow-md border-b border-red-800">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Icon & Message */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <FaIdCard className="text-xl text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">Welcome to ProGemini Academy!</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-400 text-red-950">
                  Profile Incomplete ({percent}%)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 mt-0.5">
                Complete your official student profile to generate your <strong>Digital Student ID card</strong> and access institutional records.
                {missingLabels.length > 0 && (
                  <span className="hidden lg:inline ml-1 text-yellow-200">
                    Missing: {missingLabels.slice(0, 3).join(", ")}{missingLabels.length > 3 ? "..." : ""}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Action & Progress */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {pathname !== "/student/profile" && (
              <Link
                href="/student/profile"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-brand-primary hover:bg-red-50 font-semibold text-xs sm:text-sm transition shadow-sm"
              >
                Complete Profile
                <FaArrowRight className="text-xs" />
              </Link>
            )}
            <button
              onClick={handleDismiss}
              className="p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Dismiss for this session"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-2 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
