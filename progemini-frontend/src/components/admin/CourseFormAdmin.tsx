"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaGripVertical } from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import CourseContentManager from "./CourseContentManager";
import CourseRichEditor, { type RichContent } from "./CourseRichEditor";

const EMPTY_RICH: RichContent = { json: null, html: "" };

interface Category {
  id: string;
  name: string;
}

interface CustomSection {
  id: string;
  label: string;
  content: RichContent;
}

interface CourseFormAdminProps {
  categories: Category[];
  instructors?: any[]; // kept for backward compat, not used in new form
  courseId?: string;
  initialData?: any;
}

const STEPS = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Main Content" },
  { id: 3, label: "Course Content & SEO" },
];

// Helper: parse a DB string value back into RichContent
function parseRich(raw: string | null | undefined): RichContent {
  if (!raw) return EMPTY_RICH;

  const normalizeParsed = (input: any): RichContent => {
    if (!input) return EMPTY_RICH;
    if (typeof input === "string") {
      try {
        return normalizeParsed(JSON.parse(input));
      } catch {
        return { json: null, html: `<p>${input}</p>` };
      }
    }
    if (input && (input.json !== undefined || input.html !== undefined)) {
      return {
        json: input.json ?? null,
        html: typeof input.html === "string" ? input.html : "",
      };
    }
    if (input?.type === "doc") return { json: input, html: "" };
    return EMPTY_RICH;
  };

  try {
    return normalizeParsed(JSON.parse(raw));
  } catch (_) {}
  // legacy plain text — wrap as HTML paragraph(s)
  return { json: null, html: `<p>${raw}</p>` };
}

export default function CourseFormAdmin({
  categories,
  courseId,
  initialData,
}: CourseFormAdminProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(
    courseId || null
  );

  const [uploadingFeatureImage, setUploadingFeatureImage] = useState(false);
  const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null);
  const [aspectRatioSuccess, setAspectRatioSuccess] = useState<boolean>(false);

  const handleFeatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate aspect ratio
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspect = width / height;
      const targetAspect = 16 / 9; // 1.7777
      
      // Check if it's close to 16:9
      if (Math.abs(aspect - targetAspect) > 0.15) {
        setAspectRatioWarning(`Selected image is ${width}x${height} (aspect ratio ${aspect.toFixed(2)}). A 16:9 landscape image (e.g., 1920x1080px) is highly recommended for best results.`);
        setAspectRatioSuccess(false);
      } else {
        setAspectRatioWarning(null);
        setAspectRatioSuccess(true);
      }
    };

    setUploadingFeatureImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "course-features");

    try {
      const data = await apiClient.upload<{ downloadUrl: string }>("/v1/files/upload", uploadData);
      setFormData((prev) => ({ ...prev, featureImage: data.downloadUrl }));
      toast.success("Feature image uploaded successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload feature image");
    } finally {
      setUploadingFeatureImage(false);
    }
  };

  const [formData, setFormData] = useState({
    // Step 1
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    totalLearningHour: initialData?.totalLearningHour || "",
    award: initialData?.award || "",
    awardedBy: initialData?.awardedBy || "",
    featureImage: initialData?.featureImage || "",
    credits: initialData?.credits || 0,
    deliveryMode: initialData?.deliveryMode || "",
    categoryId: initialData?.categoryId || "",
    status: initialData?.status || "DRAFT",
    isPublished: initialData?.isPublished || false,
    isFeatured: initialData?.isFeatured || false,
    // Step 3 SEO
    tags: initialData?.tags?.join(", ") || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords?.join(", ") || "",
    featuredOrder: initialData?.featuredOrder || null as number | null,
  });

  // Step 2 — rich text fields (TipTap JSON)
  const [richData, setRichData] = useState({
    whatYouLearn: parseRich(initialData?.whatYouLearn),
    introduction: parseRich(initialData?.introduction),
    requirements: parseRich(initialData?.requirements),
    assessmentsVerification: parseRich(initialData?.assessmentsVerification),
    academicAchievement: parseRich(initialData?.academicAchievement),
    careerOpportunities: parseRich(initialData?.careerOpportunities),
  });

  // Step 2 — custom (user-defined) sections
  const [customSections, setCustomSections] = useState<CustomSection[]>(() => {
    if (!initialData?.customSections) return [];
    try {
      const parsed = JSON.parse(initialData.customSections);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((s: any) => ({
        id: s.id || crypto.randomUUID(),
        label: s.label || "",
        content: parseRich(typeof s.content === "string" ? s.content : JSON.stringify(s.content)),
      }));
    } catch { return []; }
  });

  const addCustomSection = () => {
    setCustomSections(prev => [...prev, { id: crypto.randomUUID(), label: "", content: EMPTY_RICH }]);
  };

  const removeCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
  };

  const updateCustomSectionLabel = (id: string, label: string) => {
    setCustomSections(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  const updateCustomSectionContent = (id: string, content: RichContent) => {
    setCustomSections(prev => prev.map(s => s.id === id ? { ...s, content } : s));
  };

  // Featured order: track which slots are taken by other courses
  const [takenOrders, setTakenOrders] = useState<number[]>([]);

  useEffect(() => {
    if (!formData.isFeatured) return;
    const excludeParam = courseId ? `?excludeId=${courseId}` : "";
    apiClient.get<{ featuredOrder: number }[]>(`/admin/courses/featured-orders${excludeParam}`)
      .then((data) => {
        setTakenOrders(data.map((d) => d.featuredOrder).filter(Boolean));
      })
      .catch(() => {});
  }, [formData.isFeatured, courseId]);

  const setRich = (field: keyof typeof richData) => (content: RichContent) =>
    setRichData((prev) => ({ ...prev, [field]: content }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "title" && !courseId) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        setFormData((prev) => ({ ...prev, slug }));
      }
    }
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    slug:
      formData.slug.trim() ||
      formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    shortDescription: formData.shortDescription.trim(),
    description: formData.description.trim(),
    totalLearningHour: formData.totalLearningHour.trim(),
    award: formData.award.trim(),
    awardedBy: formData.awardedBy.trim(),
    featureImage: formData.featureImage.trim(),
    credits: Number(formData.credits) || 0,
    deliveryMode: formData.deliveryMode.trim() || null,
    categoryId: formData.categoryId,
    status: formData.status,
    isPublished: formData.isPublished,
    isFeatured: formData.isFeatured,
    featuredOrder: formData.isFeatured && formData.featuredOrder ? formData.featuredOrder : null,
    // Rich text fields — serialised as JSON strings (ensure they have both json and html)
    whatYouLearn: JSON.stringify({
      json: richData.whatYouLearn.json,
      html: richData.whatYouLearn.html || "",
    }),
    introduction: JSON.stringify({
      json: richData.introduction.json,
      html: richData.introduction.html || "",
    }),
    requirements: JSON.stringify({
      json: richData.requirements.json,
      html: richData.requirements.html || "",
    }),
    assessmentsVerification: JSON.stringify({
      json: richData.assessmentsVerification.json,
      html: richData.assessmentsVerification.html || "",
    }),
    academicAchievement: JSON.stringify({
      json: richData.academicAchievement.json,
      html: richData.academicAchievement.html || "",
    }),
    careerOpportunities: JSON.stringify({
      json: richData.careerOpportunities.json,
      html: richData.careerOpportunities.html || "",
    }),
    tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
    metaTitle: formData.metaTitle.trim(),
    metaDescription: formData.metaDescription.trim(),
    metaKeywords: formData.metaKeywords.split(",").map((k: string) => k.trim()).filter(Boolean),
    customSections: JSON.stringify(
      customSections.map(s => ({
        id: s.id,
        label: s.label,
        content: JSON.stringify({ json: s.content.json, html: s.content.html || "" }),
      }))
    ),
  });

  const saveCourse = async (): Promise<string | null> => {
    if (!formData.title.trim()) { toast.error("Course title is required"); return null; }
    if (!formData.categoryId) { toast.error("Please select a category. If no categories appear, contact your administrator."); return null; }
    setLoading(true);
    try {
      const payload = buildPayload();
      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));
      console.log("📝 Selected categoryId:", formData.categoryId);
      
      const saved = createdCourseId
        ? await apiClient.put<any>(`/admin/courses/${createdCourseId}`, payload)
        : await apiClient.post<any>("/admin/courses", payload);
      const id = saved.id || createdCourseId;
      setCreatedCourseId(id);
      toast.success(createdCourseId ? "Course updated!" : "Course created!");
      return id;
    } catch (error: any) {
      console.error("💥 Save error:", error);
      toast.error(error.message || "Failed to save course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveSEO = async () => {
    if (!createdCourseId) return;
    setLoading(true);
    try {
      await apiClient.put(`/admin/courses/${createdCourseId}`, buildPayload());
      toast.success("SEO settings saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save SEO");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const id = await saveCourse();
      if (!id) return;
      setStep(3);
    }
  };

  const goToStep = async (target: number) => {
    if (target === step) return;
    if (target > step && step < 3) {
      if (step === 2) {
        const id = await saveCourse();
        if (!id) return;
      }
    }
    setStep(target);
  };

  return (
    <div className="max-w-5xl">
      {/* Step bar */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() => goToStep(s.id)}
              disabled={s.id === 3 && !createdCourseId}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                step === s.id
                  ? "bg-brand-primary text-white"
                  : s.id < step || createdCourseId
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.id
                    ? "bg-white text-brand-primary"
                    : s.id < step || createdCourseId
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                {s.id < step || (createdCourseId && s.id < step) ? "✓" : s.id}
              </span>
              <span>{s.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mx-1 ${s.id < step ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            {categories.length === 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">⚠️ No categories available</p>
                <p className="text-red-600 text-sm mt-1">Please create at least one active category before creating a course.</p>
              </div>
            )}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g., Advanced Data Science Programme" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL Slug <span className="text-red-500">*</span></label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="input-field" placeholder="auto-generated from title" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input-field" required aria-label="Category">
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Total Learning Hours</label>
                  <input type="text" name="totalLearningHour" value={formData.totalLearningHour} onChange={handleChange} className="input-field" placeholder="e.g., 120 Hours, 12 Weeks" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Short Description <span className="text-red-500">*</span></label>
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} className="input-field" placeholder="Brief summary shown on course listings (160-300 characters)" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Full Course Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="input-field" placeholder="Detailed course overview, target audience, and key outcomes..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Award / Qualification</label>
                  <input type="text" name="award" value={formData.award} onChange={handleChange} className="input-field" placeholder="e.g., Level 5 Diploma, UK Accredited Certificate" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Awarded By</label>
                  <input type="text" name="awardedBy" value={formData.awardedBy} onChange={handleChange} className="input-field" placeholder="e.g., Ofqual, ATHE, Progemini" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Credits</label>
                  <input type="number" name="credits" value={formData.credits} onChange={handleChange} className="input-field" min="0" placeholder="e.g., 120" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Mode <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" name="deliveryMode" value={formData.deliveryMode} onChange={handleChange} className="input-field" placeholder="e.g., Online, In-person, Blended, Self-paced" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50/50 rounded-xl border border-gray-200 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Option 1: Feature Image URL</label>
                  <input 
                    type="text" 
                    name="featureImage" 
                    value={formData.featureImage} 
                    onChange={handleChange} 
                    className="input-field" 
                    placeholder="https://example.com/course-hero.jpg" 
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Direct link to an externally hosted image.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Option 2: Direct File Upload (MinIO)</label>
                  <div className="flex flex-col space-y-3">
                    <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-brand-primary cursor-pointer transition-colors bg-white hover:bg-red-50/10 group">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        onChange={handleFeatureImageUpload} 
                        className="hidden" 
                        disabled={uploadingFeatureImage}
                      />
                      {uploadingFeatureImage ? (
                        <div className="flex flex-col items-center space-y-2 py-2">
                          <div className="animate-spin w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full" />
                          <span className="text-xs font-semibold text-gray-500">Uploading to MinIO...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2 text-center py-2">
                          <svg className="w-8 h-8 text-gray-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-700">Click to upload featured image</span>
                          <span className="text-[10px] text-gray-400">PNG, JPEG, JPG or WEBP (Max 10MB)</span>
                        </div>
                      )}
                    </label>

                    {/* Image formatting encouragement & validation */}
                    <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-start space-x-2">
                        <span className="text-brand-primary text-xs mt-0.5">ℹ️</span>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-700">Landscape Format Recommended</p>
                          <p className="text-[11px] text-gray-600 leading-normal">
                            Please upload a <strong>landscape (16:9)</strong> aspect ratio image (e.g., <strong>1920x1080px</strong>). This ensures the course hero header and cards look optimal across all devices.
                          </p>
                        </div>
                      </div>
                    </div>

                    {aspectRatioWarning && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                        <span className="mt-0.5">⚠️</span>
                        <span>{aspectRatioWarning}</span>
                      </div>
                    )}

                    {aspectRatioSuccess && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-xs text-green-800 flex items-start space-x-2">
                        <span className="mt-0.5">✓</span>
                        <span>Perfect aspect ratio! The selected image matches the landscape (16:9) format.</span>
                      </div>
                    )}
                  </div>
                </div>

                {formData.featureImage && (
                  <div className="col-span-1 md:col-span-2 border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      <img 
                        src={formData.featureImage} 
                        alt="Featured Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">Current Featured Image:</p>
                      <p className="text-[11px] text-gray-500 font-mono break-all mt-1">{formData.featureImage}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, featureImage: "" }));
                          setAspectRatioWarning(null);
                          setAspectRatioSuccess(false);
                        }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Status <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className="input-field" required aria-label="Status">
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="mr-2 w-4 h-4" />
                    <span className="text-sm font-medium">Publish Course</span>
                  </label>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="mr-2 w-4 h-4" />
                    <span className="text-sm font-medium">Feature on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Featured Order Picker — only shown when isFeatured is checked */}
              {formData.isFeatured && (
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-1">
                    Homepage Position <span className="text-gray-400 font-normal">(optional, 1–12)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Select the slot this course appears in on the homepage. Grey slots are already taken.</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                      const isTaken = takenOrders.includes(num);
                      const isSelected = formData.featuredOrder === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isTaken}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              featuredOrder: isSelected ? null : num,
                            }))
                          }
                          title={isTaken ? "Slot already taken" : `Position ${num}`}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border-2 ${
                            isTaken
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-brand-primary border-brand-primary text-white shadow-md scale-110"
                              : "bg-white border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                    {formData.featuredOrder && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, featuredOrder: null }))}
                        className="px-3 h-10 rounded-lg text-xs border-2 border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={handleNextStep} disabled={loading || categories.length === 0} className="btn-primary">
              {categories.length === 0 ? "No categories available" : (loading ? "Saving..." : "Continue to Main Content →")}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Main Content</h2>
            <p className="text-sm text-gray-500 mb-6">This content renders directly on the public course page.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">What You Will Learn</label>
                <p className="text-xs text-gray-500 mb-2">Use bullet or numbered lists for individual outcomes.</p>
                <CourseRichEditor
                  value={richData.whatYouLearn}
                  onChange={setRich("whatYouLearn")}
                  placeholder="Master data analysis fundamentals&#10;Build machine learning pipelines"
                  minHeight="min-h-[180px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overview of Course</label>
                <p className="text-xs text-gray-500 mb-2">Rendered as a rich paragraph directly on the public course page.</p>
                <CourseRichEditor
                  value={richData.introduction}
                  onChange={setRich("introduction")}
                  placeholder="Write a compelling introduction about this course..."
                  minHeight="min-h-[160px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <p className="text-xs text-gray-500 mb-2">Use bullet or numbered lists for individual requirements.</p>
                <CourseRichEditor
                  value={richData.requirements}
                  onChange={setRich("requirements")}
                  placeholder="Basic computer literacy&#10;Access to a laptop or desktop"
                  minHeight="min-h-[160px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assessments and Verification</label>
                <CourseRichEditor
                  value={richData.assessmentsVerification}
                  onChange={setRich("assessmentsVerification")}
                  placeholder="Describe how students are assessed, verified, and how their work is evaluated..."
                  minHeight="min-h-[160px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Academic Achievement</label>
                <CourseRichEditor
                  value={richData.academicAchievement}
                  onChange={setRich("academicAchievement")}
                  placeholder="Describe the academic credentials, qualifications, or recognition students will gain..."
                  minHeight="min-h-[160px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Career Opportunities</label>
                <CourseRichEditor
                  value={richData.careerOpportunities}
                  onChange={setRich("careerOpportunities")}
                  placeholder="Describe the career paths, job roles, and professional opportunities this course opens up..."
                  minHeight="min-h-[160px]"
                />
              </div>
            </div>
          </div>

          {/* Custom Sections */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Custom Sections</h2>
                <p className="text-sm text-gray-500 mt-1">Add your own sections with custom labels. Only sections with content will appear on the public course page.</p>
              </div>
              <button
                type="button"
                onClick={addCustomSection}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <FaPlus className="text-xs" /> Add Section
              </button>
            </div>

            {customSections.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                <FaPlus className="mx-auto mb-3 text-2xl opacity-40" />
                <p className="text-sm">No custom sections yet. Click "Add Section" to create one.</p>
              </div>
            )}

            <div className="space-y-6">
              {customSections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <FaGripVertical className="text-gray-300 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Section {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomSection(section.id)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium border border-red-200"
                    >
                      <FaTrash className="text-xs" /> Remove
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1.5">
                      Section Label <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">(shown as the section heading)</span>
                    </label>
                    <input
                      type="text"
                      value={section.label}
                      onChange={e => updateCustomSectionLabel(section.id, e.target.value)}
                      className="input-field"
                      placeholder="e.g., Programme Structure, Entry Requirements, Funding Options..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Content</label>
                    <CourseRichEditor
                      value={section.content}
                      onChange={content => updateCustomSectionContent(section.id, content)}
                      placeholder="Write the content for this section..."
                      minHeight="min-h-[160px]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {customSections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="flex items-center gap-2 text-sm text-brand-primary hover:opacity-80 transition-opacity font-medium"
                >
                  <FaPlus className="text-xs" /> Add another section
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
            <div className="flex gap-3">
              <button type="button" onClick={saveCourse} disabled={loading} className="px-6 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-red-50">
                {loading ? "Saving..." : "Save Draft"}
              </button>
              <button type="button" onClick={handleNextStep} disabled={loading} className="btn-primary">
                {loading ? "Saving..." : "Save and Continue to Course Content"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="space-y-8">
          {!courseId && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Course saved successfully!</p>
              <p className="text-green-600 text-sm mt-1">Now add course modules and lectures below.</p>
            </div>
          )}
          {createdCourseId && <CourseContentManager courseId={createdCourseId} />}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">SEO and Tags</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="input-field" placeholder="data science, machine learning, python" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Title</label>
                  <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="input-field" placeholder="Leave empty to use course title" maxLength={70} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Keywords (comma-separated)</label>
                  <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="input-field" placeholder="data science, AI, analytics" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={2} className="input-field" placeholder="Brief SEO description (150-160 characters)" maxLength={160} />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
            <div className="flex gap-3">
              <button type="button" onClick={saveSEO} disabled={loading} className="btn-primary">
                {loading ? "Saving..." : "Save SEO Settings"}
              </button>
              <button type="button" onClick={() => router.push("/admin/courses")} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Done — Go to Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
