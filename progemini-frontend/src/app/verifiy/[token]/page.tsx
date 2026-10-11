import { redirect } from "next/navigation";

export default function VerifiyTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;
  redirect(`/credentials/verify?token=${encodeURIComponent(token)}`);
}
