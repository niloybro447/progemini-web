function loadConfig() {
  let databaseUrl = process.env.DATABASE_URL || "";
  databaseUrl = databaseUrl.replace(/^["']/, "").replace(/["']$/, "").trim();
  process.env.DATABASE_URL = databaseUrl;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required but was not set. Check your .env file.");
  }

  return {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
    corsOrigin: process.env.CORS_ORIGIN || "*",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
    databaseUrl,
    resendApiKey: process.env.RESEND_API_KEY || "",
    smtpFrom: process.env.SMTP_FROM || "Progemini Academy <noreply@progemini.academy>",
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    },
    minio: {
      endpoint: process.env.MINIO_ENDPOINT || "185.239.208.206",
      port: parseInt(process.env.MINIO_PORT || "9000", 10),
      accessKey: process.env.MINIO_ACCESS_KEY || "",
      secretKey: process.env.MINIO_SECRET_KEY || "",
      bucketName: process.env.MINIO_BUCKET_NAME || "progemini-files",
      useSSL: process.env.MINIO_USE_SSL === "true",
    },
    cleanupApiKey: process.env.CLEANUP_API_KEY || "",
  } as const;
}

export const config = loadConfig();
