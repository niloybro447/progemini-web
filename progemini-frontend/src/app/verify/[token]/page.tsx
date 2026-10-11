import { redirect } from "next/navigation";

export default function VerifyTokenPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = params.token;
  redirect(`/credentials/verify?token=${encodeURIComponent(token)}`);
}
