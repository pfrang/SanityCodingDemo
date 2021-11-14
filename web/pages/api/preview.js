import { postBySlugQuery } from '../../lib/queries'
import { previewClient } from '../../lib/sanity.server'

export default async function preview(req, res) {
  const corsOrigin =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:3333`
    : `https://your-studio.sanity.studio`

res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3333')
res.setHeader('Access-Control-Allow-Credentials', true)
  // Check the secret and next parameters
  // This secret should only be known to this API route and the CMS
  if (
    req.query.secret !== process.env.SANITY_PREVIEW_SECRET ||
    !req.query.slug
  ) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // Check if the post with the given `slug` exists
  const post = await previewClient.fetch(postBySlugQuery, {
    slug: req.query.slug,
    credentials: `include`,
    headers: {Cookie: req.headers.cookie},
  })

  // If the slug doesn't exist prevent preview mode from being enabled
  if (!post) {
    return res.status(401).json({ message: 'Invalid slug' })
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({})

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.writeHead(307, { Location: `/posts/${post.slug}` })
  res.end()
}