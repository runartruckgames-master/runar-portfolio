# Security and publishing model

## Current deployment

GitHub Pages is a **public static host**. Every committed HTML, JavaScript, JSON, and media file can be accessed by anyone who knows its URL. `noindex` is not access control.

- `index.html` is the public visitor experience.
- `studio.html` is a **local-draft editor, not an authenticated admin panel**. Its URL is publicly accessible. Changes are saved in the current browser only and do not change the live site.
- `?preview` reads drafts from the current browser's localStorage; it is not a protected staging environment.
- Publishing still requires authenticated access to GitHub. Never enter GitHub tokens or passwords into the editor or commit them to the repository.
- Media committed to this repository is public. Do not publish private photos, documents, or credentials.

## Required before calling the admin system complete

1. Choose a trusted identity provider and server-side publishing backend.
2. Authorize every upload, edit, delete, and publish request **on the server**, with a single allowlisted owner account.
3. Use short-lived authenticated sessions, CSRF protection, upload size/type checks, safe storage names, and rate limits.
4. Store drafts separately from published assets. Require an explicit publish action.
5. Test that an unauthenticated visitor cannot mutate content, including by calling API endpoints directly.
6. Verify responsive preview, media playback, and deployment from an ordinary browser.

**Do not rely on hidden buttons, secret URLs, localStorage flags, or client-side passwords for administrator security.**
