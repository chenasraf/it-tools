export type ResizeMode = 'stretch' | 'percentage' | 'width' | 'height'

export interface Dimensions {
  width: number
  height: number
}

export interface ResizeParams {
  mode: ResizeMode
  source: Dimensions
  stretch?: Dimensions
  percentage?: number
  width?: number
  height?: number
}

export function computeTargetDimensions({
  mode,
  source,
  stretch,
  percentage,
  width,
  height,
}: ResizeParams): Dimensions {
  switch (mode) {
    case 'stretch':
      return {
        width: Math.max(1, Math.round(stretch?.width ?? source.width)),
        height: Math.max(1, Math.round(stretch?.height ?? source.height)),
      }
    case 'percentage': {
      const factor = (percentage ?? 100) / 100
      return {
        width: Math.max(1, Math.round(source.width * factor)),
        height: Math.max(1, Math.round(source.height * factor)),
      }
    }
    case 'width': {
      const targetWidth = Math.max(1, Math.round(width ?? source.width))
      return {
        width: targetWidth,
        height: Math.max(1, Math.round((targetWidth / source.width) * source.height)),
      }
    }
    case 'height': {
      const targetHeight = Math.max(1, Math.round(height ?? source.height))
      return {
        width: Math.max(1, Math.round((targetHeight / source.height) * source.width)),
        height: targetHeight,
      }
    }
  }
}

export async function resizeImage({
  image,
  target,
  mimeType,
  quality,
}: {
  image: HTMLImageElement
  target: Dimensions
  mimeType: string
  quality?: number
}): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = target.width
  canvas.height = target.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get 2D canvas context')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, target.width, target.height)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode resized image'))),
      mimeType,
      quality,
    )
  })
}
