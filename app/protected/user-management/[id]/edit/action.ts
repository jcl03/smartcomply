"use server";

import { updateUserRole } from "../../actions";

export async function handleUpdateRole(formData: FormData) {
  const result = await updateUserRole(formData);
  return result;
}
