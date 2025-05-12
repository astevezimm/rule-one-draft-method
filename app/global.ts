export type Map = {
  name: string
  url: string
  votes: number
  image: Uint8Array<ArrayBufferLike> | null
}

export type Player = {
  name: string
  mapVote: number
  id: string
  admin?: boolean
  factions_to_ban: {wiki: string, id: string, name: string}[]
  number_of_bans: number
}

export type PlayerSelected = 'yes' | 'no' | 'loading' | 'admin'

export function isPlayerSelected(value: any): value is PlayerSelected {
  return value === 'yes' || value === 'no' || value === 'loading' || value === 'admin'
}

export const pageHeading = "Welcome to the Rule One Draft Method"
export const playerKey = (gameId: string) => `${gameId}-player`

export async function extractMapImage(file: File | undefined) {
  if (!file) return null

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const maxSize = 800
        let width = img.width
        let height = img.height
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (maxSize / width) * height
            width = maxSize
          } else {
            width = (maxSize / height) * width
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              resolve(await blob.arrayBuffer())
            } else {
              resolve(null)
            }
          },
          'image/jpeg',
          0.6
        )
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
