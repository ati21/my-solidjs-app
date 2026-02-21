import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBuzWpB-fEGElW3Tf8d2s2n8reaBzAXhE", // <-- replace
  authDomain: "my-solidjs-app.firebaseapp.com",
  projectId: "my-solidjs-app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/* Helper wrappers --------------------------------------------------- */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

/* Listen for token changes – we store the Firebase ID token in localStorage */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const idToken = await user.getIdToken();
    localStorage.setItem("fb_id_token", idToken);
  } else {
    localStorage.removeItem("fb_id_token");
  }
});