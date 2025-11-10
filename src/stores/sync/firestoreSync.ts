import { getDb } from '../../lib/firebase'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import type { Application } from '../../types/application'

export async function subscribeApplications(
  ownerId: string,
  onChange: (apps: Application[]) => void
) {
  const db = await getDb()
  const q = query(
    collection(db, 'applications'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  )
  const unsub = onSnapshot(q, (snap) => {
    const apps = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Application[]
    onChange(apps)
  })
  return unsub
}




