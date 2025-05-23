import {useLoaderData} from '@remix-run/react'
import {Player, playerKey, PlayerSelected} from '~/global'
import {useEffect, useState} from 'react'

type PlayersProps = {
  playerSelected: PlayerSelected
  selectedPlayer: string | null
  onSelectPlayer: (player: Player) => void
  onCancelSelection: () => void
}

type PlayersData = {
  players: Player[]
  currentPlayer: number
}

export default function Players({playerSelected, selectedPlayer, onSelectPlayer, onCancelSelection}: PlayersProps) {
  const {players, currentPlayer} = useLoaderData() as PlayersData
  
  function selected(player: Player) {
    return !selectedPlayer || player.id === selectedPlayer ? 'selected' : ''
  }
  
  function current(player: Player) {
    return player.id === players[currentPlayer].id ? 'current' : ''
  }
  
  const selectionDone = ['admin', 'yes'].includes(playerSelected)

  return (
    <ul className={`players card ${selectionDone ? "" : "unselected"}`}>
      {players.map(player => (
        <li key={player.id}>
          <button
            disabled={selectionDone}
            onClick={() => onSelectPlayer(player)}
            className={`${selected(player)} ${current(player)}`}
          >
            {player.name}
          </button>
          {playerSelected === "yes" && selectedPlayer === player.id && (
            <button className="cancel-selection" onClick={onCancelSelection}>x</button>
          )}
        </li>
      ))}
    </ul>
  )
}
