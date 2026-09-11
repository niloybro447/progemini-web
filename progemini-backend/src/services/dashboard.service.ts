import { prisma } from "@/config/prisma";

export async function getDashboardStats() {
  const [
    totalUsers,
    totalCourses,
    totalOrders,
    totalApplications,
    revenue,
    recentUsers,
    recentOrders,
    recentApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.order.count(),
    prisma.application.count(),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { student: { select: { name: true, email: true } }, course: { select: { title: true } } },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, thumbnail: true } },
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalCourses,
      totalOrders,
      totalApplications,
      totalRevenue: revenue._sum?.amount || 0,
    },
    recentUsers,
    recentOrders,
    recentApplications,
  };
}
