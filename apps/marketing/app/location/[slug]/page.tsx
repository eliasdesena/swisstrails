import { redirect } from "next/navigation";
import { APP_URL } from "@/lib/config";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LocationRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`${APP_URL}/location/${slug}`);
}
