export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  token?: string;
}

export async function login(_payload: LoginPayload): Promise<AuthSession> {
  return { user: null };
}

export async function logout(): Promise<void> {}
