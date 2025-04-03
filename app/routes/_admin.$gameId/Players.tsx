import {useLoaderData} from '@remix-run/react'
import {Player, PlayerSelected} from '~/global'

type PlayersProps = {
  playerSelected: PlayerSelected
  onSelectPlayer: (player: Player) => void
}

export default function Players({playerSelected, onSelectPlayer}: PlayersProps) {
  const {players} = useLoaderData() as {players: Player[]}
  
  return null
}
