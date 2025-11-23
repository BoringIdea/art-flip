import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ArtFlip Docs',
  description: 'ArtFlip NFT Documentation - An NFT liquidity solution with intelligent pricing',
  lang: 'en-US',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Introduction', link: '/introduce' },
      { text: 'Getting Started', link: '/getting-started/quickstart' },
      { text: 'Basics', link: '/basics/' }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Flip Introduction', link: '/introduce' },
            { text: 'Why Choose Flip', link: '/why-choose-flip' }
          ]
        },
        {
          text: 'Getting Started',
          items: [
            { text: 'Quickstart', link: '/getting-started/quickstart' }
          ]
        },
        {
          text: 'Basics',
          items: [
            { text: 'Architecture', link: '/basics/architecture' },
            { text: 'Core', link: '/basics/core' },
            { text: 'Roadmap', link: '/basics/roadmap' }
          ]
        }
      ],
      '/basics/': [
        {
          text: 'Basics',
          items: [
            { text: 'Architecture', link: '/basics/architecture' },
            { text: 'Core', link: '/basics/core' },
            { text: 'Roadmap', link: '/basics/roadmap' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HashIdea/art-flip' }
    ],

    footer: {
      message: 'Released under the BLS License.',
      copyright: 'Copyright © 2025 ArtFlip'
    },

    search: {
      provider: 'local'
    }
  }
})

