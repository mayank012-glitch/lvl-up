import { getChatGPTUser } from "@/app/chatgpt-auth";
// The verified Site owner's account. Authorization is enforced on the server.
export async function isAdmin() {
  const user = await getChatGPTUser();
  return Boolean(user?.userId && user.email.toLowerCase() === "mayank012.md@gmail.com");
}
