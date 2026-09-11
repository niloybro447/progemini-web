import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";

// ─── Helpers ───────────────────────────────────────────

function serializeField(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

// ─── Consultants ───────────────────────────────────────

export async function listConsultants(all?: boolean) {
  return prisma.consultant.findMany({
    where: all ? {} : { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getConsultantById(id: string) {
  const item = await prisma.consultant.findUnique({ where: { id } });
  if (!item) throw AppError.notFound("Consultant not found");
  return item;
}

export async function createConsultant(data: Record<string, unknown>) {
  return prisma.consultant.create({
    data: {
      name: data.name as string,
      designation: data.designation as string,
      extensions: (data.extensions as string) || null,
      email: (data.email as string) || null,
      linkedIn: (data.linkedIn as string) || null,
      imageUrl: (data.imageUrl as string) || null,
      profile: serializeField(data.profile),
      order: (data.order as number) || 0,
      isActive: data.isActive !== undefined ? (data.isActive as boolean) : true,
    },
  });
}

export async function updateConsultant(id: string, data: Record<string, unknown>) {
  await getConsultantById(id);
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.extensions !== undefined) updateData.extensions = data.extensions;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.linkedIn !== undefined) updateData.linkedIn = data.linkedIn;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.profile !== undefined) updateData.profile = serializeField(data.profile);
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return prisma.consultant.update({ where: { id }, data: updateData });
}

export async function deleteConsultant(id: string) {
  await getConsultantById(id);
  await prisma.consultant.delete({ where: { id } });
  return { success: true };
}

// ─── Academic Team ─────────────────────────────────────

export async function listAcademicTeam(all?: boolean) {
  return prisma.academicMember.findMany({
    where: all ? {} : { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getAcademicMemberById(id: string) {
  const item = await prisma.academicMember.findUnique({ where: { id } });
  if (!item) throw AppError.notFound("Academic member not found");
  return item;
}

export async function createAcademicMember(data: Record<string, unknown>) {
  return prisma.academicMember.create({
    data: {
      name: data.name as string,
      designation: data.designation as string,
      extensions: (data.extensions as string) || null,
      email: (data.email as string) || null,
      linkedIn: (data.linkedIn as string) || null,
      imageUrl: (data.imageUrl as string) || null,
      profile: serializeField(data.profile),
      order: (data.order as number) || 0,
      isActive: data.isActive !== undefined ? (data.isActive as boolean) : true,
    },
  });
}

export async function updateAcademicMember(id: string, data: Record<string, unknown>) {
  await getAcademicMemberById(id);
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.extensions !== undefined) updateData.extensions = data.extensions;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.linkedIn !== undefined) updateData.linkedIn = data.linkedIn;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.profile !== undefined) updateData.profile = serializeField(data.profile);
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return prisma.academicMember.update({ where: { id }, data: updateData });
}

export async function deleteAcademicMember(id: string) {
  await getAcademicMemberById(id);
  await prisma.academicMember.delete({ where: { id } });
  return { success: true };
}

// ─── Partner Universities ──────────────────────────────

export async function listPartnerUniversities(all?: boolean) {
  return prisma.partnerUniversity.findMany({
    where: all ? {} : { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getPartnerUniversityById(id: string) {
  const item = await prisma.partnerUniversity.findUnique({ where: { id } });
  if (!item) throw AppError.notFound("Partner university not found");
  return item;
}

export async function createPartnerUniversity(data: Record<string, unknown>) {
  return prisma.partnerUniversity.create({
    data: {
      name: data.name as string,
      logoUrl: (data.logoUrl as string) || null,
      websiteUrl: (data.websiteUrl as string) || null,
      description: serializeField(data.description),
      order: (data.order as number) || 0,
      isActive: data.isActive !== undefined ? (data.isActive as boolean) : true,
    },
  });
}

export async function updatePartnerUniversity(id: string, data: Record<string, unknown>) {
  await getPartnerUniversityById(id);
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
  if (data.description !== undefined) updateData.description = serializeField(data.description);
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return prisma.partnerUniversity.update({ where: { id }, data: updateData });
}

export async function deletePartnerUniversity(id: string) {
  await getPartnerUniversityById(id);
  await prisma.partnerUniversity.delete({ where: { id } });
  return { success: true };
}

// ─── Hero Slides ───────────────────────────────────────

export async function listHeroSlides(all?: boolean) {
  return prisma.heroSlide.findMany({
    where: all ? {} : { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getHeroSlideById(id: string) {
  const item = await prisma.heroSlide.findUnique({ where: { id } });
  if (!item) throw AppError.notFound("Hero slide not found");
  return item;
}

export async function createHeroSlide(data: Record<string, unknown>) {
  return prisma.heroSlide.create({
    data: {
      title: data.title as string,
      eyebrow: (data.eyebrow as string) || null,
      description: (data.description as string) || null,
      imageUrl: data.imageUrl as string,
      order: (data.order as number) || 0,
      isActive: data.isActive !== undefined ? (data.isActive as boolean) : true,
    },
  });
}

export async function updateHeroSlide(id: string, data: Record<string, unknown>) {
  await getHeroSlideById(id);
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.eyebrow !== undefined) updateData.eyebrow = data.eyebrow;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return prisma.heroSlide.update({ where: { id }, data: updateData });
}

export async function deleteHeroSlide(id: string) {
  await getHeroSlideById(id);
  await prisma.heroSlide.delete({ where: { id } });
  return { success: true };
}

// ─── Senior Profiles ───────────────────────────────────

export async function listSeniorProfiles(all?: boolean) {
  return prisma.seniorProfile.findMany({
    where: all ? {} : { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getSeniorProfileById(id: string) {
  const item = await prisma.seniorProfile.findUnique({ where: { id } });
  if (!item) throw AppError.notFound("Senior profile not found");
  return item;
}

export async function getSeniorProfileBySlug(slug: string) {
  const item = await prisma.seniorProfile.findUnique({ where: { slug } });
  if (!item) throw AppError.notFound("Senior profile not found");
  return item;
}

export async function createSeniorProfile(data: Record<string, unknown>) {
  const slug = (data.slug as string).toLowerCase().trim();
  const existing = await prisma.seniorProfile.findUnique({ where: { slug } });
  if (existing) throw AppError.badRequest("A profile with this slug already exists");

  return prisma.seniorProfile.create({
    data: {
      name: data.name as string,
      slug,
      position: data.position as string,
      quality: (data.quality as string) || "",
      description: (data.description as string) || "",
      imageUrlDesktop: (data.imageUrlDesktop as string) || "",
      imageUrlMobile: (data.imageUrlMobile as string) || "",
      objectPos: (data.objectPos as string) || "object-center",
      linkedin: (data.linkedin as string) || "#",
      heroItems: (data.heroItems as Array<{ label: string; value: string; selected: boolean }>) || [],
      fullDescriptionHTML: (data.fullDescriptionHTML as string) || "",
      sideDescription1HTML: (data.sideDescription1HTML as string) || "",
      sideDescription2HTML: (data.sideDescription2HTML as string) || "",
      order: (data.order as number) || 0,
      isActive: data.isActive !== undefined ? (data.isActive as boolean) : true,
    },
  });
}

export async function updateSeniorProfile(id: string, data: Record<string, unknown>) {
  await getSeniorProfileById(id);
  const updateData: Record<string, unknown> = {};
  if (data.slug !== undefined) {
    const slug = (data.slug as string).toLowerCase().trim();
    const conflict = await prisma.seniorProfile.findFirst({ where: { slug, NOT: { id } } });
    if (conflict) throw AppError.badRequest("A profile with this slug already exists");
    updateData.slug = slug;
  }
  const stringFields = ["name", "position", "quality", "description", "imageUrlDesktop", "imageUrlMobile", "objectPos", "linkedin", "fullDescriptionHTML", "sideDescription1HTML", "sideDescription2HTML"];
  for (const field of stringFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }
  if (data.heroItems !== undefined) updateData.heroItems = data.heroItems;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return prisma.seniorProfile.update({ where: { id }, data: updateData });
}

export async function deleteSeniorProfile(id: string) {
  await getSeniorProfileById(id);
  await prisma.seniorProfile.delete({ where: { id } });
  return { success: true };
}
