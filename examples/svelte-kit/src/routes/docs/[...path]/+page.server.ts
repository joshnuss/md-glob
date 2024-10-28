import { docs } from '$lib/mpress'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  const doc = await docs.get(params.path)

  if (!doc) error(404)

  return { doc }
}
