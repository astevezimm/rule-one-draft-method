export type Map = {
  name: string
  url: string
  votes: number
}

export type Player = {
  name: string
  mapVote: number
}

export type PlayerSelected = 'yes' | 'no' | 'loading'

export function isPlayerSelected(value: any): value is PlayerSelected {
  return value === 'yes' || value === 'no' || value === 'loading';
}
