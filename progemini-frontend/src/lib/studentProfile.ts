export interface ProfileCheckField {
  key: string;
  label: string;
  section: string;
  value: any;
  done: boolean;
}

export interface ProfileCompletionStats {
  fields: ProfileCheckField[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  isComplete: boolean;
  missingFields: ProfileCheckField[];
}

/**
 * Calculates student profile completeness based strictly on student-provided information,
 * explicitly excluding admin-managed institutional records (Student ID, Academic Program,
 * Started Semester, and Started Year).
 */
export function calculateProfileCompletion(user: any): ProfileCompletionStats {
  if (!user) {
    return {
      fields: [],
      completedCount: 0,
      totalCount: 13,
      percentage: 0,
      isComplete: false,
      missingFields: [],
    };
  }

  const sp = user.studentProfile || user.profile || {};

  const fields: ProfileCheckField[] = [
    // Identity & Contact Details
    {
      key: "name",
      label: "Full Name",
      section: "Personal Details",
      value: user.name,
      done: Boolean(user.name && user.name.trim().length > 0),
    },
    {
      key: "phone",
      label: "Verified Contact",
      section: "Personal Details",
      value: user.phone,
      done: Boolean(user.phone && user.phone.trim().length > 0),
    },
    {
      key: "email",
      label: "Verified Email",
      section: "Personal Details",
      value: user.email,
      done: Boolean(user.email && user.email.trim().length > 0),
    },
    {
      key: "avatar",
      label: "Profile Photo",
      section: "Identity",
      value: user.avatar,
      done: Boolean(user.avatar && String(user.avatar).trim().length > 0),
    },
    {
      key: "passport",
      label: "Passport Number",
      section: "Personal Details",
      value: sp.passport,
      done: Boolean(sp.passport && sp.passport.trim().length > 0),
    },
    {
      key: "nationality",
      label: "Nationality",
      section: "Personal Details",
      value: sp.nationality,
      done: Boolean(sp.nationality && sp.nationality.trim().length > 0),
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      section: "Personal Details",
      value: sp.dateOfBirth,
      done: Boolean(sp.dateOfBirth),
    },
    {
      key: "gender",
      label: "Sex / Gender",
      section: "Personal Details",
      value: sp.gender,
      done: Boolean(sp.gender && sp.gender.trim().length > 0),
    },
    // Next of Kin & Residential Address
    {
      key: "address",
      label: "Present Address",
      section: "Address",
      value: sp.address || user.address,
      done: Boolean(
        (sp.address && sp.address.trim().length > 0) ||
        (user.address && user.address.trim().length > 0)
      ),
    },
    {
      key: "nextOfKinRelationship",
      label: "Next of Kin Relationship",
      section: "Next of Kin",
      value: sp.nextOfKinRelationship,
      done: Boolean(sp.nextOfKinRelationship && sp.nextOfKinRelationship.trim().length > 0),
    },
    {
      key: "nextOfKinName",
      label: "Next of Kin Name",
      section: "Next of Kin",
      value: sp.nextOfKinName,
      done: Boolean(sp.nextOfKinName && sp.nextOfKinName.trim().length > 0),
    },
    {
      key: "nextOfKinPhone",
      label: "Next of Kin Phone",
      section: "Next of Kin",
      value: sp.nextOfKinPhone,
      done: Boolean(sp.nextOfKinPhone && sp.nextOfKinPhone.trim().length > 0),
    },
    {
      key: "nextOfKinEmail",
      label: "Next of Kin Email",
      section: "Next of Kin",
      value: sp.nextOfKinEmail,
      done: Boolean(sp.nextOfKinEmail && sp.nextOfKinEmail.trim().length > 0),
    },
  ];

  const completedCount = fields.filter((f) => f.done).length;
  const totalCount = fields.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;
  const missingFields = fields.filter((f) => !f.done);

  return {
    fields,
    completedCount,
    totalCount,
    percentage,
    isComplete,
    missingFields,
  };
}
