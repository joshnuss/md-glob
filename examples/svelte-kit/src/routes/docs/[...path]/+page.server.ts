import { docs } from '$lib/content'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  const doc = await docs.get(params.path)

  if (!doc) error(404)

  return { doc }
}
