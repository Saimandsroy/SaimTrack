import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SaimTrack',
    short_name: 'SaimTrack',
    description: 'Next generation tracking for study, jobs, and dsa',
    start_url: '/',
    display: 'standalone',
    background_color: '#1F1C1B',
    theme_color: '#CBA365',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
