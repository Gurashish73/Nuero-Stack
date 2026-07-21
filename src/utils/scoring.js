import { auth } from '../config/firebase';

export const awardNeuralPower = async (action, pointsOverride = null) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const idToken = await user.getIdToken();
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ action, pointsOverride }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error(`Scoring failed: ${body.error || res.status}`);
    }
  } catch (error) {
    console.error('Failed to communicate with score engine:', error);
  }
};