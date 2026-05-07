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
      '/concepts/': [
        {
          text: 'Core Concepts',
          items: [
            { text: 'Authentication', link: '/concepts/authentication' },
            { text: 'Wallets', link: '/concepts/wallets' },
            { text: 'Funding', link: '/concepts/funding' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Frontend API', link: '/api/frontend' },
            { text: 'Backend API', link: '/api/backend' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Complete Application', link: '/examples/complete-app' },
            { text: 'Common Patterns', link: '/examples/common-patterns' }
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
