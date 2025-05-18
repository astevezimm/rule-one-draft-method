import {useLoaderData} from '@remix-run/react'
import {Player, playerKey, PlayerSelected} from '~/global'
import {useEffect, useState} from 'react'

type PlayersProps = {
  playerSelected: PlayerSelected
  selectedPlayer: string | null
  onSelectPlayer: (player: Player) => void
}

type PlayersData = {
  players: Player[]
  currentPlayer: number
  state: string
}

export default function Players({playerSelected, selectedPlayer, onSelectPlayer}: PlayersProps) {
  const {players, currentPlayer, state} = useLoaderData() as PlayersData
  
  function selected(player: Player) {
    return !selectedPlayer || player.id === selectedPlayer ? 'selected' : ''
  }
  
  function current(player: Player) {
    return player.id === players[currentPlayer].id ? 'current' : ''
  }

  return (
    <ul className={`players card ${['admin', 'yes'].includes(playerSelected) ? "" : "unselected"}`}>
      {players.map(player => (
        <li key={player.id}>
          <button
            disabled={['admin', 'yes'].includes(playerSelected)}
            onClick={() => onSelectPlayer(player)}
            className={`${selected(player)} ${current(player)}`}
          >
            {player.name}
          </button>
        </li>
      ))}
    </ul>
  )
}
