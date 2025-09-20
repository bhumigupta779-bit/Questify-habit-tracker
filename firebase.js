import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Auth
export async function demoSignup() {
  const email = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@example.com"
  const pass = process.env.NEXT_PUBLIC_DEMO_PASS || "demopass123"
  try {
    await createUserWithEmailAndPassword(auth, email, pass)
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      await signInWithEmailAndPassword(auth, email, pass)
    }
  }
}
export async function signOutUser() { await signOut(auth) }

// Habits
export function subscribeToHabits(uid, setHabits) {
  const q = query(collection(db, "users", uid, "habits"), orderBy("createdAt","desc"))
  return onSnapshot(q, (snap) => {
    const arr = []
    snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }))
    setHabits(arr)
  })
}

export async function addHabit(user, title, setHabits) {
  const docRef = { title, createdAt: Date.now(), streak: 0, history: [0,0,0,0,0,0,0], color: "bg-indigo-400" }
  if (!user) {
    setHabits(prev => [{ id: Date.now().toString(), ...docRef }, ...prev])
    return
  }
  await addDoc(collection(db, "users", user.uid, "habits"), docRef)
}

export async function toggleComplete(user, habit) {
  if (!user) return
  const ref = doc(db, "users", user.uid, "habits", habit.id)
  await updateDoc(ref, { streak: (habit.streak||0)+1 })
}

export async function removeHabit(user, habit) {
  if (!user) return
  await deleteDoc(doc(db, "users", user.uid, "habits", habit.id))
}
