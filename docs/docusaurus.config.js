import { themes as prismThemes } from 'prism-react-renderer';

const config = {
  title: 'SJ Lúmen',
  tagline: "Customizable Angular Library",
  url: 'https://blassgo.github.io',
  baseUrl: '/',
  organizationName: 'COAC San José',
  projectName: 'sanjose-workspace',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/BlassGO/sanjose-workspace/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/BlassGO/sanjose-workspace/edit/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    version: 'v1.0.0',
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      style: 'dark',
      // title: 'shared-ui',
      logo: {
        alt: 'COAC San José',
        src: 'img/logo-white.png',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Documentación' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { href: '#', label: 'GitHub', position: 'right' },
        {
          href: '#',
          label: 'Download',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: "What's this?", to: '/docs/introduction' },
            { label: 'Try it now!', to: '/docs/introduction#try-it-now' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', to: '/blog' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BlassGO - Built with Docusaurus 🦖`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash'],
    },
    /*homepageFeatures: [
      {
        title: 'Cross-Device',
        description: 'A single installer for multiple devices',
      },
      {
        title: 'Open Source',
        description: 'Open documentation of its structure, code and operation.',
      },
      {
        title: 'Compact',
        description: 'Dependencies optimization. Reuse as a principle',
      },
    ],*/
    algolia: {
      appId: 'id',

      apiKey: 'key',

      indexName: 'index_name',

      contextualSearch: true,

    },
  },
};

export default config;