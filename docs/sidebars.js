/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a "Next" and "Previous" button
 - automatically add a "Edit this page" link to each doc

 More about sidebars: https://docusaurus.io/docs/sidebar
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docsSidebar: [
    'intro',
    'platform-overview',
    {
      type: 'category',
      label: 'Core Features',
      items: [
        'features/peer-support-groups',
        'features/professional-therapy',
        'features/ai-mental-health-bots',
        'features/tokenized-incentives',
        'features/decentralized-anonymity',
      ],
    },
    {
      type: 'category',
      label: 'Mentorship Programs',
      items: [
        'mentorship/index',
        'mentorship/peer-mentorship',
        'mentorship/professional-mentorship',
        'mentorship/specialized-mentorship',
      ],
    },
    {
      type: 'category',
      label: 'Tutorial',
      items: [
        'tutorial-basics/create-a-document',
        'tutorial-basics/create-a-blog-post',
        'tutorial-basics/create-a-page',
        'tutorial-basics/deploy-your-site',
        'tutorial-basics/congratulations',
      ],
    },
  ],

  // API sidebar
  apiSidebar: [
    'api/introduction',
    {
      type: 'category',
      label: 'Authentication',
      items: [
        'api/auth/overview',
        'api/auth/wallet-connection',
        'api/auth/session-management',
      ],
    },
    {
      type: 'category',
      label: 'Users',
      items: [
        'api/users/profile-management',
      ],
    },
    {
      type: 'category',
      label: 'Therapy',
      items: [
        'api/therapy/booking',
      ],
    },
    {
      type: 'category',
      label: 'Tokens',
      items: [
        'api/tokens/economics',
      ],
    },
  ],

  // Guides sidebar
  guidesSidebar: [
    {
      type: 'category',
      label: 'User Guides',
      items: [
        'user-guides/index',
        'user-guides/getting-started',
        'user-guides/account-management',
      ],
    },
  ],
};

module.exports = sidebars;
