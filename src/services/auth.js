import { supabase } from './supabase';

export async function signUpWithEmail(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { error: translateAuthError(error.message) };
  return { user: data.user, session: data.session };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const translated = translateAuthError(error.message);
    if (error.message.toLowerCase().includes('invalid login')) {
      return { error: 'NO_ACCOUNT' };
    }
    return { error: translated };
  }
  return { user: data.user, session: data.session };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return { error };
  return { session };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return { error };
  return { user };
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}

function translateAuthError(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'ACCOUNT_EXISTS';
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return 'NO_ACCOUNT';
  if (m.includes('rate limit'))
    return 'Rate limit reached. Please wait a moment.';
  if (m.includes('password should be at least'))
    return 'Password must be at least 6 characters.';
  if (m.includes('unable to validate email'))
    return 'Please enter a valid email address.';
  return message || 'Something went wrong. Please try again.';
}
