import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useLoaderData} from '@remix-run/react'
import {Map, Player, TFFaction} from '~/global'

export default function RefCardDraftPage({playerSelected, selectedPlayer, state}: DraftPageContentProps) {
  const {players, gameId, maps} = (useLoaderData() as {players: Player[], gameId: string, maps: Map[]})
  const player = players.find(player => player.id === selectedPlayer)
  const map = maps.length === 1 ? maps[0] :
    maps.find(map => map.votes = Math.max(...maps.map(m => m.votes)))

  function handleSelect(factionId: string) {
    fetch(`/api/draft-tffaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        player: player?.id,
        factionId
      })
    }).then(response => {
      if (response.ok) {
        window.location.reload()
      }
    })
  }
  
  return (
    <>
      {['yes', 'admin'].includes(playerSelected) && player ? (
        <>
          <h2>Select main game faction to draft. Rest will be passed.</h2>
          <h3>One choice for seating initiative (lowest is speaker), one for home system, and one for starting units.</h3>
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

function RefCard({faction, onSelect} : {faction: TFFaction, onSelect?: (factionId: string) => void}) {
  return (
    <li
      key={faction.id} className={`ref-card ${onSelect ? "ref-card-selectable" : ""}`}
      onClick={() => onSelect && onSelect(faction.id)}
    >
      <h3>{faction.name}</h3>
      <p className="initiative">Initiative: <span>{faction.priority}</span></p>
      <img
        src={`images/startSystems/ST_${faction.startSystem.img}.webp`}
        alt={faction.startSystem.alt}
      />
      <h4>Starting Units:</h4>
      <div className="start-units">
        {Object.keys(faction.startUnits).map((unit) => (
          <p key={`${faction.id}-${unit}`}>{unit}: {(faction.startUnits as any)[unit]}</p>
        ))}
      </div>
    </li>
  )
}
