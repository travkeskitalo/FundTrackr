import { supabase } from './supabase';
import type { User } from '@shared/schema';

export async function signUp(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Failed to create user');

  // Check if email confirmation is required
  if (data.session === null) {
    throw new Error('Please check your email to confirm your account before signing in.');
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    password: '',
    createdAt: new Date(data.user.created_at),
  };
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Failed to sign in');

  return {
    id: data.user.id,
    email: data.user.email!,
    password: '',
    createdAt: new Date(data.user.created_at),
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return {
    id: user.id,
    email: user.email!,
    password: '',
    createdAt: new Date(user.created_at),
  };
}
