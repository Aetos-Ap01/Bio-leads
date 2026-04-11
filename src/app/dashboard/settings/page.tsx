import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const [user, tenant, evolutionConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    }),
    prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { name: true },
    }),
    prisma.evolutionConfig.findUnique({
      where: { tenantId: session.user.tenantId },
      select: { apiUrl: true, globalKey: true, phoneNumber: true },
    }),
  ]);

  if (!user || !tenant) {
    redirect("/login");
  }

  return (
    <SettingsClient
      user={{ id: user.id, name: user.name, email: user.email }}
      tenantName={tenant.name}
      tenantId={session.user.tenantId!}
      evolutionConfig={evolutionConfig}
    />
  );
}
