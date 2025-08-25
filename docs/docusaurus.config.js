// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MentalVerse',
  tagline: 'Web3-Powered Mental Health Support Platform - Decentralized, Private, Community-Driven',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.mentalverse.com',
  baseUrl: '/',
  organizationName: 'mentalverse', // Usually your GitHub org/user name.
  projectName: 'mentalverse-docs', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Custom fields for MentalVerse
  customFields: {
    description: 'Comprehensive documentation for MentalVerse - the world\'s first Web3-powered mental health support platform combining blockchain technology, AI assistance, and community-driven care.',
    keywords: 'mental health, web3, blockchain, therapy, peer support, AI, decentralized, privacy, community',
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/willy264/MentalVerse/tree/main/docs/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/willy264/MentalVerse/tree/main/docs/blog/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  // plugins: [
  //   // Plugins can be added here later
  // ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'MentalVerse',
        logo: {
          alt: 'MentalVerse Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            position: 'left',
            label: 'API',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/willy264/MentalVerse',
            label: 'GitHub',
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
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/mentalverse',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/mentalverse',
              },
              {
                label: 'Telegram',
                href: 'https://t.me/mentalverse',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/willy264/MentalVerse',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MentalVerse. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

export default config;
