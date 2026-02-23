import { deleteSession } from "$lib/server/auth/session";

export async function POST({ cookies }) {

  const id = cookies.get("session");

  if (id) {
    deleteSession(id);
  }

  cookies.delete("session", { path: "/" });

  return new Response();
}