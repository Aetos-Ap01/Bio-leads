import { getActiveScript } from "@/actions/scripts";
import ScriptsClient from "@/components/ScriptsClient";
import { redirect } from "next/navigation";

export default async function ScriptsPage() {
  const { script, error } = await getActiveScript();

  if (error || !script) {
    if (error === "Not authenticated") {
      redirect("/login");
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0B0F19]">
        <p>Error loading scripts: {error}</p>
      </div>
    );
  }

  return <ScriptsClient initialSteps={script.steps} />;
}
