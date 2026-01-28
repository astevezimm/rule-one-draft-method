import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useLoaderData} from '@remix-run/react'
import {Map, Player, post} from '~/global'
import ReferenceMap from '~/routes/$gameId/ReferenceMap'
import RefCard from '~/routes/$gameId/twilightsFall/RefCard'

export default function PrioritySelectionPage({selectedPlayer}: DraftPageContentProps) {
  const {players, gameId, maps} = (useLoaderData() as {players: Player[], gameId: string, maps: Map[]})
  const player = players.find(player => player.id === selectedPlayer)
  const map = maps.length === 1 ? maps[0] :
    maps.find(map => map.votes === Math.max(...maps.map(m => m.votes)))
  const prioritySelected = !!player?.tfPriority
  
  function handleSelect(factionId: string) {
    const faction = player?.selectedTFFactions?.find(faction => faction.id === factionId)
    if (!faction) return
    post(`/api/select-tfpriority`, {
      gameId,
      player: player?.id,
      priority: faction.priority
    })
  }
  
  return (
    <>
      {prioritySelected && <h2>Waiting for other players to choose initiative</h2>}
      {!prioritySelected &&
        <>
          <h2>Now, select which to use for seating initiative / speaker</h2>
          <h3>Lowest is speaker, but speaker goes last.</h3>
        </>
      }
      {map && map.url && <div className='ref-card-draft-map'><ReferenceMap map={map} /></div>}
      <div className="ref-card-draft card main-section">
        <h2>Options for Initiative</h2>
        <ul className="ref-card-list">
          {player?.selectedTFFactions?.map((faction) => (
            <RefCard
              key={faction.id} faction={faction}
              onSelect={
                prioritySelected ? undefined : () => handleSelect(faction.id)
              }
              selected={player?.tfPriority === faction.priority}
            />
          ))}
        </ul>
      </div>
    </>
  )
}