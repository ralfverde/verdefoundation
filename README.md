# Verde+

Website for **Verde+** ([verdeplus.com](https://verdeplus.com)), a Spanish-first news and information brand for immigrants in the United States.

Verde+ is a separate brand from Verde Law. This site does not provide legal advice or legal services.

Right now the site is a single placeholder homepage.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, `src/` directory)
- TypeScript
- Tailwind CSS v4
- ESLint

## Development

Requires Node.js 20.9 or later and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run lint     # run ESLint
npm run build    # production build
npm run start    # serve the production build
```

The homepage is in `src/app/page.tsx` and the root layout (language, metadata, fonts) is in `src/app/layout.tsx`.
