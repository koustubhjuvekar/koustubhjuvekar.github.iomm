import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as required by firebase-integration-rpc skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Deterministic SHA-256 hex digest (aligned with blueprint minLength: 16, maxLength: 128)
export async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(input);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback deterministic 64-char hex for non-browser environments
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return (
    (h1 >>> 0).toString(16).padStart(8, '0') +
    (h2 >>> 0).toString(16).padStart(8, '0')
  ).repeat(4);
}

const LOCAL_CRED_STORAGE_KEY = 'kj_admin_credentials_v1';

export interface StoredAdminCredentials {
  username: string;
  passwordHash: string;
  email: string;
}

export async function getDefaultAdminCredentials(): Promise<StoredAdminCredentials> {
  const defaultHash = await sha256Hex('Admin');
  return {
    username: 'admin',
    passwordHash: defaultHash,
    email: 'koustubhjuvekarofficial@gmail.com',
  };
}

export async function loadAdminCredentials(): Promise<StoredAdminCredentials> {
  const fallback = await getDefaultAdminCredentials();

  // If Firebase user is signed in, try reading from /admins/{uid}
  if (auth.currentUser) {
    const path = `admins/${auth.currentUser.uid}`;
    try {
      const snap = await getDoc(doc(db, 'admins', auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (
          typeof data.username === 'string' &&
          typeof data.passwordHash === 'string' &&
          typeof data.email === 'string'
        ) {
          const creds: StoredAdminCredentials = {
            username: data.username,
            passwordHash: data.passwordHash,
            email: data.email,
          };
          try {
            localStorage.setItem(LOCAL_CRED_STORAGE_KEY, JSON.stringify(creds));
          } catch {
            // ignore
          }
          return creds;
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Missing or insufficient permissions')
      ) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_CRED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && parsed.passwordHash) {
        return {
          username: String(parsed.username),
          passwordHash: String(parsed.passwordHash),
          email: String(parsed.email || fallback.email),
        };
      }
    }
  } catch {
    // ignore
  }

  return fallback;
}

export async function verifyAdminLogin(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  const creds = await loadAdminCredentials();
  const inputHash = await sha256Hex(passwordInput.trim());
  const normalizedUser = usernameInput.trim().toLowerCase();
  return (
    normalizedUser === creds.username.trim().toLowerCase() &&
    inputHash === creds.passwordHash
  );
}

// Ensure /admins/{uid} exists in Firestore for the verified admin user
export async function ensureFirestoreAdminDoc(user: User): Promise<void> {
  const uid = user.uid;
  const path = `admins/${uid}`;
  const currentCreds = await loadAdminCredentials();
  const safeUsername = currentCreds.username.slice(0, 64);
  const safeEmail = (user.email || currentCreds.email).slice(0, 128);

  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    if (!snap.exists()) {
      await setDoc(doc(db, 'admins', uid), {
        ownerId: uid,
        username: safeUsername.length >= 3 ? safeUsername : 'admin',
        passwordHash: currentCreds.passwordHash,
        email: safeEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing or insufficient permissions')
    ) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    throw error;
  }
}

// Create a 6-digit OTP Challenge in Firebase Firestore (/admin_otps/{otpId}) and send via email
export async function issueFirebaseEmailOtp(targetEmail: string): Promise<{
  otpId: string;
  code: string;
  savedInFirebase: boolean;
  emailDispatched: boolean;
}> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await sha256Hex(code);
  const otpId = `otp_${Date.now()}`;
  const cleanEmail = targetEmail.trim().slice(0, 128);
  let savedInFirebase = false;

  if (auth.currentUser) {
    await ensureFirestoreAdminDoc(auth.currentUser);
    const path = `admin_otps/${otpId}`;
    try {
      await setDoc(doc(db, 'admin_otps', otpId), {
        ownerId: auth.currentUser.uid,
        email: cleanEmail,
        otpHash,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      savedInFirebase = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Missing or insufficient permissions')
      ) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  }

  // Also store challenge locally in sessionStorage so verification works seamlessly
  try {
    sessionStorage.setItem(
      'kj_active_otp_challenge',
      JSON.stringify({
        otpId,
        otpHash,
        email: cleanEmail,
        expiresAt: Date.now() + 10 * 60 * 1000,
      })
    );
  } catch {
    // ignore
  }

  // Attempt free email delivery via FormSubmit AJAX endpoint
  let emailDispatched = false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: 'Koustubh Portfolio Admin — Password Change OTP Verification',
        message: `Your 6-digit Admin Password Change OTP code is: ${code} (Valid for 10 minutes).`,
        otp_code: code,
      }),
    });
    if (res.ok) {
      emailDispatched = true;
    }
  } catch {
    // ignore network errors
  }

  return { otpId, code, savedInFirebase, emailDispatched };
}

// Verify OTP and update Admin Username & Password in Firebase Firestore (/admins/{uid})
export async function verifyOtpAndChangeAdminPassword(params: {
  otpId: string;
  otpInput: string;
  newUsername: string;
  newPassword: string;
  email: string;
}): Promise<{ ok: boolean; updatedInFirebase: boolean; message: string }> {
  const { otpId, otpInput, newUsername, newPassword, email } = params;
  const trimmedUsername = newUsername.trim().slice(0, 64);
  const trimmedPassword = newPassword.trim();
  const trimmedEmail = email.trim().slice(0, 128);

  if (trimmedUsername.length < 3) {
    return { ok: false, updatedInFirebase: false, message: 'Username must be at least 3 characters.' };
  }
  if (trimmedPassword.length < 4) {
    return { ok: false, updatedInFirebase: false, message: 'New password must be at least 4 characters.' };
  }

  const inputOtpHash = await sha256Hex(otpInput.trim());
  let otpValid = false;

  // 1. Check against Firebase Firestore /admin_otps/{otpId} if signed in
  if (auth.currentUser && otpId) {
    const otpPath = `admin_otps/${otpId}`;
    try {
      const snap = await getDoc(doc(db, 'admin_otps', otpId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'pending' && data.otpHash === inputOtpHash) {
          otpValid = true;
          await updateDoc(doc(db, 'admin_otps', otpId), {
            status: 'verified',
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Missing or insufficient permissions')
      ) {
        handleFirestoreError(error, OperationType.UPDATE, otpPath);
      }
    }
  }

  // 2. Check against active session challenge if not yet verified
  if (!otpValid) {
    try {
      const raw = sessionStorage.getItem('kj_active_otp_challenge');
      if (raw) {
        const challenge = JSON.parse(raw);
        if (
          challenge &&
          challenge.otpHash === inputOtpHash &&
          Date.now() < Number(challenge.expiresAt)
        ) {
          otpValid = true;
          sessionStorage.removeItem('kj_active_otp_challenge');
        }
      }
    } catch {
      // ignore
    }
  }

  if (!otpValid) {
    return {
      ok: false,
      updatedInFirebase: false,
      message: 'Invalid or expired 6-digit OTP code. Please check the code and try again.',
    };
  }

  const newPasswordHash = await sha256Hex(trimmedPassword);
  let updatedInFirebase = false;

  if (auth.currentUser) {
    await ensureFirestoreAdminDoc(auth.currentUser);
    const adminPath = `admins/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'admins', auth.currentUser.uid), {
        username: trimmedUsername,
        passwordHash: newPasswordHash,
        email: trimmedEmail,
        updatedAt: serverTimestamp(),
      });
      updatedInFirebase = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Missing or insufficient permissions')
      ) {
        handleFirestoreError(error, OperationType.UPDATE, adminPath);
      }
    }
  }

  const updatedCreds: StoredAdminCredentials = {
    username: trimmedUsername,
    passwordHash: newPasswordHash,
    email: trimmedEmail,
  };
  try {
    localStorage.setItem(LOCAL_CRED_STORAGE_KEY, JSON.stringify(updatedCreds));
  } catch {
    // ignore
  }

  return {
    ok: true,
    updatedInFirebase,
    message: updatedInFirebase
      ? 'Password and username updated in Firebase Firestore and local storage!'
      : 'Password and username updated! (Sign in with Google in Firebase tab to sync across devices).',
  };
}

export { signInWithPopup, signOut, onAuthStateChanged, type User };
