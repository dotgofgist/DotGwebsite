# Release Checklist

Use this checklist before and after a DotG production deployment.

## Before Deployment

- [ ] `main` branch CI has passed.
- [ ] Vercel Preview deployment is healthy.
- [ ] Preview public smoke has passed.
- [ ] Preview admin login page renders.
- [ ] Remote migration state has been reviewed.
- [ ] Production Vercel environment variables are configured.
- [ ] Supabase Auth Site URL is correct.
- [ ] Supabase Auth Redirect URLs are correct.
- [ ] Storage buckets and RLS policies are healthy.
- [ ] First production admin account exists.
- [ ] Production seed will not run automatically.
- [ ] Storage orphan/dangling/path checks have been reviewed.
- [ ] SEO metadata, robots, and sitemap have been checked.
- [ ] Production deployment approval is ready.

## After Deployment

Public routes:

- [ ] `/`
- [ ] `/about`
- [ ] `/projects`
- [ ] Project detail
- [ ] `/notices`
- [ ] Notice detail
- [ ] `/recruitment`
- [ ] `/contact`

Functional checks:

- [ ] Header
- [ ] Mobile menu
- [ ] Footer
- [ ] Project images
- [ ] Logo
- [ ] Hero image
- [ ] Contact information
- [ ] SNS links

SEO checks:

- [ ] `/robots.txt`
- [ ] `/sitemap.xml`
- [ ] canonical URLs
- [ ] Open Graph metadata
- [ ] favicon
- [ ] admin noindex

Operational checks:

- [ ] Vercel error logs
- [ ] Supabase logs
- [ ] read-only smoke test
- [ ] 404 page
- [ ] rollback target known

Avoid automated production login, CRUD mutation, image upload, storage cleanup, or production seed during post-deploy smoke.
