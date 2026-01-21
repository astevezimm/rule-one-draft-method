import {DraftPageContentProps} from '../route'
import {useLoaderData} from '@remix-run/react'
import {Map, Player, post} from '~/global'
import ReferenceMap from '../ReferenceMap'
import RefCard from './RefCard'

export default function RefCardDraftPage({playerSelected, selectedPlayer}: DraftPageContentProps) {
  const {players, gameId, maps} = (useLoaderData() as {players: Player[], gameId: string, maps: Map[]})
  const player = players.find(player => player.id === selectedPlayer)
  const map = maps.length === 1 ? maps[0] :
    maps.find(map => map.votes === Math.max(...maps.map(m => m.votes)))

  function handleSelect(factionId: string) {
    post(`/api/draft-tffaction`, {
      gameId,
      player: player?.id,
      factionId
    })
  }
  
  return (
    <>
      {['yes', 'admin'].includes(playerSelected) && player ? (
        <>
          <h2>Select main game faction to draft. Rest will be passed.</h2>
          <h3>One choice for seating initiative (lowest is speaker), one for home system, and one for starting units.</h3>
          {map && map.url && <div className='ref-card-draft-map'><ReferenceMap map={map} /></div>}
          <div className="ref-card-draft card main-section">
            {player.tfFactions && !player.waitingForDraft ? (
              <>
                <h2>Options</h2>
                <ul className="ref-card-list">
                  {player.tfFactions.map((faction) => (
                    <RefCard
                      key={faction.id} faction={faction} onSelect={() => handleSelect(faction.id)}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <h3>Waiting for next cards to draft</h3>
            )}
          </div>
            {player.selectedTFFactions && (
              <div className="ref-card-draft card main-section">
                <h2>Your Drafted Cards</h2>
                <ul className="ref-card-list">
                  {player.selectedTFFactions.map((faction) => (
                    <RefCard key={faction.id} faction={faction} />
                  ))}
                </ul>
              </div>
            )}
        </>
      ) : (<h2>Select name from above to proceed.</h2>)}
    </>
  )
}
