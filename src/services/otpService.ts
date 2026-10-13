import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const generateAndStoreOtp = async (email: string): Promise<string> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000); // 5 minutes

  await setDoc(doc(db, 'otps', email.toLowerCase()), {
    email: email.toLowerCase(),
    code,
    expiresAt
  });
  
  // Call server-side API to send email
  const response = await fetch('/api/auth/send-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });

  if (!response.ok) {
    throw new Error('Failed to send OTP email');
  }

  return code;
};

export const verifyOtp = async (email: string, code: string): Promise<boolean> => {
  const docRef = doc(db, 'otps', email.toLowerCase());
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return false;

  const data = docSnap.data();
  if (data.code === code && data.expiresAt.toMillis() > Date.now()) {
    return true;
  }
  return false;
};
