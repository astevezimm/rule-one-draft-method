export type Map = {
  name: string
  url: string
  votes: number
}

export type Player = {
  name: string
  mapVote: number
  id: string
}

export type PlayerSelected = 'yes' | 'no' | 'loading' | 'admin'

export function isPlayerSelected(value: any): value is PlayerSelected {
  return value === 'yes' || value === 'no' || value === 'loading' || value === 'admin'
}

export const pageHeading = "Welcome to the Rule One Draft Method"
export const playerKey = (gameId: string) => `${gameId}-player`
