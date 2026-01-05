
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-terracotta animate-pulse">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <span className="text-sm font-medium text-stone-500">Syncing with Tax Engine...</span>
    </div>
  );
}
