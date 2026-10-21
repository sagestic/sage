export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export async function sendContactMessage(
  _data: ContactMessage,
): Promise<{ success: boolean }> {
  return { success: true };
}
