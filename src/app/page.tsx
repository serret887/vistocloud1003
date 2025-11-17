"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

type Application = {
  id: string;
  applicationNumber: string;
  status: string;
  createdAt?: unknown;
};

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ownerId = searchParams.get("ownerId") || "";
  const ownerWorkspace = searchParams.get("ownerWorkspace") || "";
  // TODO: Change this when you go to production
  const canCreate = true || useMemo(() => Boolean(ownerId && ownerWorkspace), [ownerId, ownerWorkspace]);

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const appsRef = collection(db, "applications");
      const q = ownerId && ownerWorkspace
        ? query(appsRef, where("ownerId", "==", ownerId), where("ownerWorkspace", "==", ownerWorkspace))
        : appsRef;
      const snap = await getDocs(q);
      const results: Application[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          applicationNumber: data.applicationNumber ?? "",
          status: data.status ?? "",
          createdAt: data.createdAt,
        };
      });
      setApps(results);
    } finally {
      setLoading(false);
    }
  }, [ownerId, ownerWorkspace]);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  const onCreate = useCallback(async () => {
    if (!canCreate) {
      console.warn('Cannot create: canCreate is false');
      return;
    }
    
    console.log('Creating application...', { ownerId, ownerWorkspace });
    setCreating(true);
    
    try {
      const appsRef = collection(db, "applications");
      const applicationNumber = `APP-${Date.now()}`;
      
      console.log('Adding document to Firestore...', {
        applicationNumber,
        ownerId,
        ownerWorkspace
      });
      
      const docRef = await addDoc(appsRef, {
        applicationNumber,
        status: "draft",
        ownerId: ownerId || "default-owner", // Fallback if empty
        ownerWorkspace: ownerWorkspace || "default-workspace", // Fallback if empty
        currentStepId: "client-info",
        overallProgress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('Application created successfully!', { 
        id: docRef.id, 
        applicationNumber 
      });
      
      // Navigate to step form for the created application
      router.push(`/application?appId=${docRef.id}`);
    } catch (error) {
      console.error('Failed to create application:', error);
      // Optionally show user-friendly error message
      alert(`Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  }, [canCreate, ownerId, ownerWorkspace, router]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreate}
            disabled={!canCreate || creating}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create application"}
          </button>
        </div>
      </div>

      {!ownerId || !ownerWorkspace ? (
        <div className="mb-3 text-sm text-gray-600">
          Missing owner context. Provide ownerId and ownerWorkspace in the URL.
        </div>
      ) : null}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1">Application Number</th>
                <th className="px-2 py-1">Created At</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const createdAt: any = (a as any).createdAt;
                const createdAtStr =
                  createdAt && typeof createdAt?.toDate === "function"
                    ? createdAt.toDate().toLocaleString()
                    : typeof createdAt === "string"
                      ? createdAt
                      : "";
                return (
                  <tr key={a.id} className="border-t">
                    <td className="px-2 py-1">{a.applicationNumber}</td>
                    <td className="px-2 py-1">{createdAtStr}</td>
                    <td className="px-2 py-1">{a.status}</td>
                  </tr>
                );
              })}
              {apps.length === 0 && (
                <tr>
                  <td className="px-2 py-3" colSpan={3}>
                    No applications yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
