import {Player} from '~/global'
import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useLoaderData} from '@remix-run/react'
import factions from '~/data/factions.json'

export default function BanningPage({playerSelected, selectedPlayer}: DraftPageContentProps) {
  // sent races tied to player
  // button to ban, if banned, button to change ban
  // final submission of bans
  // number to ban determined by races to keep on start page
  // after all bans are in, move to snake draft page

  const player = (useLoaderData() as {players: Player[]})
    .players.find(player => player.id === selectedPlayer)
  
  return (
    <>
      <h2>Players are now listed in initiative order</h2>
      <div className="main-section card">
        {['yes', 'admin'].includes(playerSelected) ? (
            <>
              <h2>Ban ${player?.number_of_bans} factions from the following</h2>
              <ul>
                {player?.factions_to_ban.map((faction, index) => (
                  <li key={`ban-${index}`}>
                    <Faction id={faction} index={index} />
                  </li>
                ))}
              </ul>
            </>
          ) : <h2>Select name above to reveal factions to ban</h2>
        }
      </div>
    </>
  )
}

function Faction({id, index}: {id: string, index: number}) {
  function findFaction(id: string) {
    for (const category of factions) {
      const faction = category.factions.find(faction => faction.id === id)
      if (faction) return faction
    }
  }
  const faction = findFaction(id)
  if (!faction) return null
  return <></> // continue from here
}
