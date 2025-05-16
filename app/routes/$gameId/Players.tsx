import {useLoaderData} from '@remix-run/react'
import {Player, playerKey, PlayerSelected} from '~/global'
import {useEffect, useState} from 'react'

type PlayersProps = {
  playerSelected: PlayerSelected
  selectedPlayer: string | null
  onSelectPlayer: (player: Player) => void
}

export default function Players({playerSelected, selectedPlayer, onSelectPlayer}: PlayersProps) {
  const {players, gameId} = useLoaderData() as {players: Player[], gameId: string}

  return (
    <ul className={`players card ${['admin', 'yes'].includes(playerSelected) ? "" : "unselected"}`}>
      {players.map(player => (
        <li key={player.id}>
          <button
            disabled={['admin', 'yes'].includes(playerSelected)}
            onClick={() => onSelectPlayer(player)}
            className={!selectedPlayer || player.id === selectedPlayer ? 'selected' : ''}
          >
            {player.name}
          </button>
        </li>
      ))}
    </ul>
  )
}
