"use server";

import { updateUserRole } from "../../actions";

export async function handleUpdateRole(formData: FormData) {
  const result = await updateUserRole(formData);
  if (result.error) {
    console.error(result.error);
  }
  return;
}
