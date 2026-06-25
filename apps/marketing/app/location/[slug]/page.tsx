import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

// On the marketing domain (swiss-trails.com/location/slug),
// redirect to the app domain where the full page lives.
export default async function LocationRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`https://app.swiss-trails.com/location/${slug}`);
}
