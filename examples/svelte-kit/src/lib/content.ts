import { glob } from 'md-glob'

export const docs = glob('./docs/**/*.md')
export const blog = glob('./posts/*.md')
