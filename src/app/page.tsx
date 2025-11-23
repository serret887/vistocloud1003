"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { DataTable } from "@/components/data-table";
import { applicationsColumns } from "@/components/ApplicationsTableColumns";
import { Button } from "@/components/ui/button";
import type { Application } from "@/types/application";
import { defaultStepId, getStepPath } from "@/lib/applicationSteps";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ownerId = searchParams.get("ownerId") || "";
  const ownerWorkspace = searchParams.get("ownerWorkspace") || "";
  // TODO: Change this when you go to production
  const canCreateMemo = useMemo(() => Boolean(ownerId && ownerWorkspace), [ownerId, ownerWorkspace]);
  const canCreate = true || canCreateMemo;

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
        const data = d.data();
        return {
          id: d.id,
          applicationNumber: data.applicationNumber ?? "",
          status: data.status ?? "draft",
          createdAt: data.createdAt,
          ownerId: data.ownerId ?? "",
          ownerWorkspace: data.ownerWorkspace ?? "",
          currentStepId: data.currentStepId,
          overallProgress: data.overallProgress,
          updatedAt: data.updatedAt,
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
      const docRef = doc(appsRef);
      const applicationNumber = docRef.id;
      
      console.log('Adding document to Firestore...', {
        applicationNumber,
        ownerId,
        ownerWorkspace
      });
      
      await setDoc(docRef, {
        applicationNumber,
        status: "draft",
        ownerId,
        ownerWorkspace,
        currentStepId: defaultStepId,
        overallProgress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('Application created successfully!', { 
        id: docRef.id, 
        applicationNumber 
      });
      
      // Navigate to step form for the created application
      router.push(getStepPath(docRef.id, defaultStepId));
    } catch (error) {
      console.error('Failed to create application:', error);
      // Optionally show user-friendly error message
      alert(`Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  }, [canCreate, ownerId, ownerWorkspace, router]);

  const handleRowClick = useCallback((application: Application) => {
    const targetStep = application.currentStepId ?? defaultStepId;
    router.push(getStepPath(application.id, targetStep));
  }, [router]);

  console.log('canCreate', canCreate);
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={onCreate}
            disabled={!canCreate || creating}
          >
            {creating ? "Creating…" : "Create application"}
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading applications...</div>
        </div>
      ) : (
        <DataTable
          columns={applicationsColumns}
          data={apps}
          searchKey="applicationNumber"
          searchPlaceholder="Search by application number..."
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
