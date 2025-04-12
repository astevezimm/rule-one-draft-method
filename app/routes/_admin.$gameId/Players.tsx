import {useLoaderData} from '@remix-run/react'
import {Player, playerKey, PlayerSelected} from '~/global'
import {useEffect, useState} from 'react'

type PlayersProps = {
  playerSelected: PlayerSelected
  onSelectPlayer: (player: Player) => void
}

export default function Players({playerSelected, onSelectPlayer}: PlayersProps) {
  const {players, gameId} = useLoaderData() as {players: Player[], gameId: string}
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(
    playerSelected === 'admin' ? players[0].id : null
  )
  
  useEffect(() => {
    if (['admin', 'yes'].includes(playerSelected) && !selectedPlayer) {
      setSelectedPlayer(localStorage.getItem(playerKey(gameId)))
    }
  }, [playerSelected, selectedPlayer])
  
  function handleClick(player: Player) {
    setSelectedPlayer(player.id)
    onSelectPlayer(player)
  }

  return (
    <ul>
      {players.map(player => (
        <li key={player.id}>
          <button
            disabled={['admin', 'yes'].includes(playerSelected)}
            onClick={() => handleClick(player)}
            className={player.id === selectedPlayer ? 'selected' : ''}
          >
            {player.name}
          </button>
        </li>
      ))}
    </ul>
  )
}
