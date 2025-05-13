import {Player} from '~/global'
import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useLoaderData} from '@remix-run/react'

export default function BanningPage({playerSelected, selectedPlayer}: DraftPageContentProps) {
  // final submission of bans
  // number to ban determined by races to keep on start page
  // after all bans are in, move to snake draft page

  const player = (useLoaderData() as {players: Player[]})
    .players.find(player => player.id === selectedPlayer)
  
  return (
    <>
      <h2>Players are now listed in initiative order</h2>
      <div className="banning main-section card">
        {['yes', 'admin'].includes(playerSelected) ? (
            <>
              <h2>Ban <span>{player?.number_of_bans}</span> factions from the following</h2>
              <ul>
                {player?.factions_to_ban.map((faction, index) => (
                  <li key={`ban-${index}`}>
                    <Faction faction={faction} index={index} />
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

function Faction({faction, index}: {faction: {wiki: string, id: string, name: string}, index: number}) {
  if (!faction) return null
  return (
    <>
      <a href={faction.wiki} target="_blank" rel="noopener noreferrer">
        <img src={`images/${faction.id}.jpg`} alt={faction.name} />
      </a>
      <label htmlFor={`ban-${index}`}>Ban</label>
      <input type="checkbox" id={`ban-${index}`} />
    </>
  )
}
