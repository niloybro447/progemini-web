import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import { stripe } from "@/utils/stripe";
import { logger } from "@/utils/logger";

export async function createOrder(studentId: string, data: { courseId: string; paymentMethod?: string }) {
  const course = await prisma.course.findUnique({ where: { id: data.courseId } });
  if (!course) throw AppError.notFound("Course not found");

  const existingOrder = await prisma.order.findFirst({
    where: { studentId, courseId: data.courseId, status: "COMPLETED" },
  });
  if (existingOrder) throw AppError.badRequest("Already purchased this course");

  const amount = course.discountPrice || course.price;
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      amount,
      discount: course.discountPrice ? course.price - course.discountPrice : 0,
      tax: 0,
      total: amount,
      status: "PENDING",
      paymentMethod: data.paymentMethod || "stripe",
      studentId,
      courseId: data.courseId,
    },
  });

  if (!data.paymentMethod || data.paymentMethod === "stripe") {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: { orderId: order.id, courseId: data.courseId, studentId },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: paymentIntent.id },
      });

      return { order, clientSecret: paymentIntent.client_secret };
    } catch (err) {
      logger.error({ err }, "Failed to create Stripe PaymentIntent");
      throw AppError.internal("Failed to create payment");
    }
  }

  return { order };
}

export async function listOrders(studentId: string) {
  return prisma.order.findMany({
    where: { studentId },
    include: { course: { select: { id: true, title: true, thumbnail: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function handleStripeWebhook(body: Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const order = await prisma.order.findFirst({ where: { paymentId: paymentIntent.id } });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED", transactionId: paymentIntent.id },
      });

      const course = await prisma.course.findUnique({
        where: { id: order.courseId },
        include: { sections: { include: { lessons: true } } },
      });
      if (course) {
        const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
        await prisma.enrollment.create({
          data: { studentId: order.studentId, courseId: order.courseId, totalLessons },
        });
      }
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    await prisma.order.updateMany({
      where: { paymentId: paymentIntent.id },
      data: { status: "FAILED" },
    });
  } else {
    logger.info({ type: event.type }, "Unhandled Stripe event");
  }

  return { received: true };
}
