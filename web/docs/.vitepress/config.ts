import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'EasyAuth',
  description: 'The fastest way to onboard users to Solana with embedded wallets and seamless funding',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Frontend', link: '/frontend/' },
      { text: 'Backend', link: '/backend/' },
      { text: 'API Reference', link: '/api/' }
    ],

    sidebar: {
      '/frontend/': [
        {
          text: 'Frontend Integration',
          items: [
            { text: 'Overview', link: '/frontend/' },
            { text: 'Svelte (First-Class)', link: '/frontend/svelte' },
            { text: 'React', link: '/frontend/react' },
            { text: 'Vue.js', link: '/frontend/vue' },
            { text: 'Angular', link: '/frontend/angular' }
          ]
        }
      ],
      '/backend/': [
        {
          text: 'Backend Integration',
          items: [
            { text: 'Overview', link: '/backend/' },
            { text: 'Node.js (First-Class)', link: '/backend/nodejs' },
            { text: 'Python', link: '/backend/python' },
            { text: 'Go', link: '/backend/golang' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Frontend SDK', link: '/api/frontend' },
            { text: 'Backend SDK', link: '/api/backend' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AlphaTechini/EasyAuth' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 EasyAuth'
    },

    search: {
      provider: 'local'
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ]
})
