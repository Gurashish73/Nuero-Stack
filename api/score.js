import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const ACTION_POINTS = {
  daily_login: 5,
  complete_workout: 25,
  bdnf_sync: 10,
  vault_mastery: 40,
  diet_log: 15,
  green_time: 10,
  water_drink: 5,
  ultradian_sprint: 50,
  math_sprint: 15,
  breathing_reset: 10,
  hemisphere_switch: 20,
  external_protocol: 15,
  timeline_task_toggle: 10
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: 'Missing token' });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { action, pointsOverride } = req.body || {};
  let points = ACTION_POINTS[action];

  if (points === undefined && typeof pointsOverride === 'number') {
    points = pointsOverride;
  }

  if (points === undefined) {
    return res.status(400).json({ error: `Unknown action: "${action}"` });
  }

  try {
    const userRef = db.collection('directory').doc(decoded.uid);
    await userRef.set(
      { score: admin.firestore.FieldValue.increment(points) },
      { merge: true }
    );
    return res.status(200).json({ awarded: points });
  } catch (err) {
    console.error('Score Award Error:', err);
    return res.status(500).json({ error: 'Failed to update score' });
  }
}