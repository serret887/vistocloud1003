import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from '$env/dynamic/private';

const projectId = env.FIREBASE_PROJECT_ID || env.GCP_PROJECT_ID || 'demo-project';

function getApp() {
	if (getApps().length) return getApps()[0];
	const json = env.FIREBASE_SERVICE_ACCOUNT_JSON;
	const credential = json ? cert(JSON.parse(json)) : undefined;
	return initializeApp({ projectId, credential });
}

export const db = getFirestore(getApp());

