# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project. Find the one that suits you on the [deployment section of the documentation](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html).

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://docs.strapi.io) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>




===========

## Local development (Strapi + Zuse CMS + website)

Start everything from this folder in one terminal:

```
npm run dev:all
```

| Service | URL |
|---|---|
| Strapi | http://localhost:1338/admin |
| Zuse CMS | http://localhost:3100 |
| Website | http://localhost:7100 |

- Output from each is prefixed `[strapi]`, `[cms]`, `[site]`; it prints the URLs once all three answer.
- Anything already running on its port is left alone, so it's safe to run again.
- `npm run dev:all -- cms site` starts only those.
- Ctrl-C stops everything it started.

The website runs on **7100** (its `dev:local` script) because the CMS (`SITE_URL`) and Strapi's page refresh (`SITE_REVALIDATE_URL`) expect it there. `npm run dev` inside `zuse-site` uses 7000, which works but won't refresh when you publish.

Or start them separately:

```
cd /Users/zusedigital/Downloads/zuse-next-strapi && npm run develop
cd /Users/zusedigital/Downloads/zuse-next-strapi/zuse-cms && npm run dev
cd /Users/zusedigital/Downloads/zuse-next-strapi/zuse-site && npm run dev:local
```
