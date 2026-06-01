import { Resize } from '@vicons/tabler'
import { defineTool } from '../tool'

export const tool = defineTool({
  name: 'Image resizer',
  path: '/image-resizer',
  description:
    'Resize an image by stretching to a fixed size, by percentage, or by width/height while keeping the aspect ratio.',
  keywords: [
    'image',
    'resize',
    'resizer',
    'scale',
    'dimensions',
    'width',
    'height',
    'aspect',
    'ratio',
    'png',
    'jpg',
    'jpeg',
    'webp',
  ],
  component: () => import('./image-resizer.vue'),
  icon: Resize,
  createdAt: new Date('2026-06-02'),
})
