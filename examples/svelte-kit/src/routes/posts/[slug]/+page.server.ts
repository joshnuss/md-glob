import { blog } from '$lib/content'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  const post = await blog.get(params.slug)

  if (!post) error(404)

  return { post }
}
