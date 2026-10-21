export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  return null;
}
