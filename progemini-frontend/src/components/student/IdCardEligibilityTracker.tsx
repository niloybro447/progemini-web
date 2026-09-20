"use client";

import React from "react";
import Link from "next/link";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaIdCard,
  FaUserCheck,
  FaFileSignature,
  FaGraduationCap,
  FaFingerprint,
  FaArrowRight,
  FaLock,
} from "react-icons/fa";

interface IdCardEligibilityTrackerProps {
  isProfileComplete: boolean;
  hasApplied: boolean;
  hasApprovedApplication: boolean;
  hasProgram: boolean;
  hasIntake: boolean;
  hasStudentId: boolean;
  studentIdValue?: string | null;
  programValue?: string | null;
  intakeValue?: string | null;
  onCompleteProfileClick?: () => void;
}

export default function IdCardEligibilityTracker({
  isProfileComplete,
  hasApplied,
  hasApprovedApplication,
  hasProgram,
  hasIntake,
  hasStudentId,
  studentIdValue,
  programValue,
  intakeValue,
  onCompleteProfileClick,
}: IdCardEligibilityTrackerProps) {
  const steps = [
    {
      id: 1,
      title: "Complete Student Profile",
      desc: "Provide mandatory personal details, demographics, and upload passport/ID standard photo.",
      done: isProfileComplete,
      icon: FaUserCheck,
      action: !isProfileComplete && onCompleteProfileClick ? (
        <button
          onClick={onCompleteProfileClick}
          className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition shadow-xs"
        >
          Complete Profile Now <FaArrowRight className="text-[10px]" />
        </button>
      ) : null,
    },
    {
      id: 2,
      title: "Submit Programme Application",
      desc: "Submit your formal admission application with required academic documents.",
      done: hasApplied,
      icon: FaFileSignature,
      action: !hasApplied ? (
        <Link
          href="/courses"
          className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition shadow-xs"
        >
          Browse Courses & Apply <FaArrowRight className="text-[10px]" />
        </Link>
      ) : null,
    },
    {
      id: 3,
      title: "Admissions Review & Approval",
      desc: hasApprovedApplication
        ? "Application officially approved by ProGemini admissions board."
        : hasApplied
        ? "Application is currently under review by admissions."
        : "Pending application submission.",
      done: hasApprovedApplication,
      icon: FaCheckCircle,
      pendingText: hasApplied ? "Under Review" : "Pending Application",
    },
    {
      id: 4,
      title: "Academic Programme & Intake Clearance",
      desc: hasProgram && hasIntake
        ? `Cleared for ${programValue || "Programme"} (${intakeValue || "Intake"}).`
        : "Admissions registry assigns confirmed academic programme and starting semester/year.",
      done: hasProgram && hasIntake,
      icon: FaGraduationCap,
      pendingText: "Registry Processing",
    },
    {
      id: 5,
      title: "Official Student ID Issuance",
      desc: hasStudentId
        ? `Official ID Assigned: ${studentIdValue}`
        : "Unique institutional Student ID assigned and cleared by administrative office.",
      done: hasStudentId,
      icon: FaFingerprint,
      pendingText: "Pending ID Assignment",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
              <FaLock className="text-sm" />
            </div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Digital Student ID Card
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete the clearance steps below to unlock your verified institutional credential with dynamic QR verification.
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
          Locked ({completedCount}/5)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-semibold text-gray-700">Clearance Readiness</span>
          <span className="font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Steps */}
      <div className="mt-5 space-y-3.5">
        {steps.map((step) => {
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                step.done
                  ? "bg-green-50/50 border-green-200 text-gray-800"
                  : "bg-gray-50/60 border-gray-200 text-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                    step.done
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.done ? <FaCheckCircle className="text-sm" /> : step.id}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        step.done ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.done ? (
                      <span className="text-[10px] font-bold text-green-700 uppercase bg-green-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                        Cleared
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 uppercase bg-amber-100/70 px-2 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0">
                        <FaClock className="text-[9px]" /> {step.pendingText || "Pending"}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {step.desc}
                  </p>

                  {step.action}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Disclaimer Note */}
      <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 leading-relaxed flex items-start gap-2">
        <FaIdCard className="text-gray-400 text-sm flex-shrink-0 mt-0.5" />
        <span>
          Digital student credentials are authentic institutional documents protected by digital security seals. They are issued only after rigorous administrative clearance.
        </span>
      </div>
    </div>
  );
}
