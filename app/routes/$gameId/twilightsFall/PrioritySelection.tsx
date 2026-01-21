import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useLoaderData} from '@remix-run/react'
import {Map, Player, post} from '~/global'

export default function PrioritySelection({playerSelected, selectedPlayer}: DraftPageContentProps) {
  const {players, gameId, maps} = (useLoaderData() as {players: Player[], gameId: string, maps: Map[]})
  const player = players.find(player => player.id === selectedPlayer)
  const map = maps.length === 1 ? maps[0] :
    maps.find(map => map.votes === Math.max(...maps.map(m => m.votes)))
  
  function handleSelect(factionId: string) {
    const faction = player?.selectedTFFactions?.find(faction => faction.id === factionId)
    if (!faction) return
    post(`/api/select-tfpriority`, {
      gameId,
      player: player?.id,
      priority: faction.priority
    })
  }
  
  // continue from here
}