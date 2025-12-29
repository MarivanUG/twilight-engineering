import { db, storage, auth } from './firebase'; // Import auth
import { sampleSettings, sampleSlides, sampleProducts, sampleProjects, sampleTeam, sampleMessages, sampleServices, sampleTestimonials, samplePartners } from './seedData';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; import type { User as FirebaseAuthUser } from 'firebase/auth'; // Import auth functions

// Generic file upload helper
export const uploadFile = async (path: string, file: File) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};

const isLocalMock = () => {
  try {
    const envFlag = (import.meta as any).env?.VITE_USE_LOCAL_MOCK === 'true';
    const persisted = typeof window !== 'undefined' && !!localStorage.getItem('dev_admin');
    return envFlag || persisted;
  } catch {
    return false;
  }
};

// Admin Authentication
export const adminSignIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // For simplicity, any logged-in user is considered an admin for now.
    // In a real app, you'd check custom claims or a Firestore user profile for an 'admin' role.
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Admin Sign In Error:", error);
    throw error;
  }
};

export const adminSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Admin Sign Out Error:", error);
    throw error;
  }
};

type AuthStateChangedCallback = (user: FirebaseAuthUser | null) => void;

export const onAdminAuthStateChanged = (callback: AuthStateChangedCallback) => {
  return onAuthStateChanged(auth, callback);
};

// Settings
export const getSettings = async () => {
  if (isLocalMock()) return sampleSettings;
  const q = query(collection(db, 'settings'));
  const snap = await getDocs(q);
  const data: any = {};
  snap.forEach((d) => Object.assign(data, d.data()));
  return data;
};

export const updateSettings = async (settings: Record<string, any>) => {
  const docRef = doc(db, 'settings', 'site');
  await setDoc(docRef, settings, { merge: true });
  return true;
};

// Slides
export const getSlides = async () => {
  if (isLocalMock()) return sampleSlides;
  const q = query(collection(db, 'slides'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addSlide = async (data: { title: string; subtitle?: string; imageFile?: File | null; order?: number }) => {
  const colRef = collection(db, 'slides');
  const slideDoc = await addDoc(colRef, { title: data.title, subtitle: data.subtitle || '', order: data.order || 0, imageUrl: '' });
  if (data.imageFile) {
    const storageRef = ref(storage, `slides/${slideDoc.id}`);
    await uploadBytes(storageRef, data.imageFile);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'slides', slideDoc.id), { imageUrl: url });
  }
  return slideDoc.id;
};

export const updateSlide = async (id: string, data: { title?: string; subtitle?: string; order?: number; imageFile?: File | null }) => {
  const updates: Record<string, any> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.subtitle !== undefined) updates.subtitle = data.subtitle;
  if (data.order !== undefined) updates.order = data.order;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'slides', id), updates);
  if (data.imageFile) {
    const url = await uploadFile(`slides/${id}`, data.imageFile);
    await updateDoc(doc(db, 'slides', id), { imageUrl: url });
  }
  return true;
};

export const deleteSlide = async (id: string) => {
  await deleteDoc(doc(db, 'slides', id));
  return true;
};

// Services
export const getServices = async () => {
  if (isLocalMock()) return sampleServices;
  const q = query(collection(db, 'services'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addService = async (data: { title: string; description?: string; icon?: string; order?: number }) => {
  const colRef = collection(db, 'services');
  const serviceDoc = await addDoc(colRef, { title: data.title, description: data.description || '', icon: data.icon || '', order: data.order || 0, createdAt: Date.now() });
  return serviceDoc.id;
};

export const updateService = async (id: string, data: { title?: string; description?: string; icon?: string; order?: number }) => {
  const updates: Record<string, any> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.icon !== undefined) updates.icon = data.icon;
  if (data.order !== undefined) updates.order = data.order;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'services', id), updates);
  return true;
};

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, 'services', id));
  return true;
};

// Products
export const getProducts = async () => {
  if (isLocalMock()) return sampleProducts;
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data: { name: string; price: number; description?: string; imageFile?: File | null }) => {
  const colRef = collection(db, 'products');
  const prodDoc = await addDoc(colRef, { name: data.name, price: data.price, description: data.description || '', imageUrl: '', createdAt: Date.now() });
  if (data.imageFile) {
    const storageRef = ref(storage, `products/${prodDoc.id}`);
    await uploadBytes(storageRef, data.imageFile);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'products', prodDoc.id), { imageUrl: url });
  }
  return prodDoc.id;
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
  return true;
};

export const updateProduct = async (id: string, data: { name?: string; price?: number; description?: string; imageFile?: File | null; inStock?: boolean; featured?: boolean }) => {
  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.price !== undefined) updates.price = data.price;
  if (data.description !== undefined) updates.description = data.description;
  if (data.inStock !== undefined) updates.inStock = data.inStock;
  if (data.featured !== undefined) updates.featured = data.featured;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'products', id), updates);
  if (data.imageFile) {
    const url = await uploadFile(`products/${id}`, data.imageFile);
    await updateDoc(doc(db, 'products', id), { imageUrl: url });
  }
  return true;
};

// Projects
export const getProjects = async () => {
  if (isLocalMock()) return sampleProjects;
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addProject = async (data: { title: string; summary?: string; imageFile?: File | null }) => {
  const colRef = collection(db, 'projects');
  const projDoc = await addDoc(colRef, { title: data.title, summary: data.summary || '', imageUrl: '', createdAt: Date.now() });
  if (data.imageFile) {
    const storageRef = ref(storage, `projects/${projDoc.id}`);
    await uploadBytes(storageRef, data.imageFile);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'projects', projDoc.id), { imageUrl: url });
  }
  return projDoc.id;
};

// Team members
export const getTeamMembers = async () => {
  if (isLocalMock()) return sampleTeam;
  const q = query(collection(db, 'team'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addTeamMember = async (data: { name: string; role?: string; bio?: string; imageFile?: File | null }) => {
  const colRef = collection(db, 'team');
  const docRef = await addDoc(colRef, { name: data.name, role: data.role || '', bio: data.bio || '', imageUrl: '', createdAt: Date.now() });
  if (data.imageFile) {
    const url = await uploadFile(`team/${docRef.id}`, data.imageFile);
    await updateDoc(doc(db, 'team', docRef.id), { imageUrl: url });
  }
  return docRef.id;
};

export const deleteTeamMember = async (id: string) => {
  await deleteDoc(doc(db, 'team', id));
  return true;
};

export const updateTeamMember = async (id: string, data: { name?: string; role?: string; bio?: string; imageFile?: File | null }) => {
  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.role !== undefined) updates.role = data.role;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'team', id), updates);
  if (data.imageFile) {
    const url = await uploadFile(`team/${id}`, data.imageFile);
    await updateDoc(doc(db, 'team', id), { imageUrl: url });
  }
  return true;
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(db, 'projects', id));
  return true;
};

export const updateProject = async (id: string, data: { title?: string; summary?: string; imageFile?: File | null; client?: string; category?: string; location?: string; date?: string; stats?: string[]; gallery?: string[]; }) => {
  const updates: Record<string, any> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.summary !== undefined) updates.summary = data.summary;
  if (data.client !== undefined) updates.client = data.client;
  if (data.category !== undefined) updates.category = data.category;
  if (data.location !== undefined) updates.location = data.location;
  if (data.date !== undefined) updates.date = data.date;
  if (data.stats !== undefined) updates.stats = data.stats;
  if (data.gallery !== undefined) updates.gallery = data.gallery;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'projects', id), updates);
  if (data.imageFile) {
    const url = await uploadFile(`projects/${id}`, data.imageFile);
    await updateDoc(doc(db, 'projects', id), { imageUrl: url });
  }
  return true;
};

// Testimonials
export const getTestimonials = async () => {
  if (isLocalMock()) return sampleTestimonials;
  const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addTestimonial = async (data: { client: string; role?: string; text: string; imageFile?: File | null }) => {
  const colRef = collection(db, 'testimonials');
  const docRef = await addDoc(colRef, { client: data.client, role: data.role || '', text: data.text, imageUrl: '', createdAt: Date.now() });
  if (data.imageFile) {
    const url = await uploadFile(`testimonials/${docRef.id}`, data.imageFile);
    await updateDoc(doc(db, 'testimonials', docRef.id), { imageUrl: url });
  }
  return docRef.id;
};

export const updateTestimonial = async (id: string, data: { client?: string; role?: string; text?: string; imageFile?: File | null }) => {
  const updates: Record<string, any> = {};
  if (data.client !== undefined) updates.client = data.client;
  if (data.role !== undefined) updates.role = data.role;
  if (data.text !== undefined) updates.text = data.text;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'testimonials', id), updates);
  if (data.imageFile) {
    const url = await uploadFile(`testimonials/${id}`, data.imageFile);
    await updateDoc(doc(db, 'testimonials', id), { imageUrl: url });
  }
  return true;
};

export const deleteTestimonial = async (id: string) => {
  await deleteDoc(doc(db, 'testimonials', id));
  return true;
};

// Partners
export const getPartners = async () => {
  if (isLocalMock()) return samplePartners;
  const q = query(collection(db, 'partners'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addPartner = async (data: { name: string; logoFile?: File | null; order?: number }) => {
  const colRef = collection(db, 'partners');
  const partnerDoc = await addDoc(colRef, { name: data.name, logoUrl: '', order: data.order || 0, createdAt: Date.now() });
  if (data.logoFile) {
    const storageRef = ref(storage, `partners/${partnerDoc.id}`);
    await uploadBytes(storageRef, data.logoFile);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'partners', partnerDoc.id), { logoUrl: url });
  }
  return partnerDoc.id;
};

export const updatePartner = async (id: string, data: { name?: string; logoFile?: File | null; order?: number }) => {
  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.order !== undefined) updates.order = data.order;
  if (Object.keys(updates).length) await updateDoc(doc(db, 'partners', id), updates);
  if (data.logoFile) {
    const url = await uploadFile(`partners/${id}`, data.logoFile);
    await updateDoc(doc(db, 'partners', id), { logoUrl: url });
  }
  return true;
};

export const deletePartner = async (id: string) => {
  await deleteDoc(doc(db, 'partners', id));
  return true;
};

// Messages / Chat
export const getMessages = async () => {
  if (isLocalMock()) return sampleMessages;
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const sendMessage = async (message: { from: string; text: string }) => {
  const colRef = collection(db, 'messages');
  const msg = await addDoc(colRef, { ...message, createdAt: Date.now() });
  try {
    // Also add a lightweight notification for admin UIs
    const notifRef = collection(db, 'notifications');
    await addDoc(notifRef, {
      type: 'message',
      refId: msg.id,
      title: `New message from ${message.from}`,
      body: message.text?.slice(0, 200) || '',
      read: false,
      createdAt: Date.now()
    });
  } catch (err) {
    console.error('Failed to create notification for message', err);
  }
  return msg.id;
};

export const deleteMessage = async (id: string) => {
  await deleteDoc(doc(db, 'messages', id));
  return true;
};

// Typing / presence helpers
export const setTyping = async (id: string, name?: string) => {
  const docRef = doc(db, 'typing', id);
  await setDoc(docRef, { id, name: name || 'visitor', lastActive: Date.now() });
  return true;
};

export const clearTyping = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'typing', id));
  } catch (err) {
    // ignore
  }
  return true;
};

// Notifications
export const getNotifications = async () => {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const markNotificationRead = async (id: string) => {
  await updateDoc(doc(db, 'notifications', id), { read: true });
  return true;
};

export const markNotificationReadByRef = async (refId: string) => {
  try {
    const q = query(collection(db, 'notifications'), where('refId', '==', refId), orderBy('createdAt', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, 'notifications', docId), { read: true });
      return true;
    }
    return false;
  } catch (err) {
    console.error('markNotificationReadByRef error', err);
    return false;
  }
};
