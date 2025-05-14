import {Player} from '~/global'
import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useLoaderData} from '@remix-run/react'
import {ChangeEvent, ChangeEventHandler, useState} from 'react'

export default function BanningPage({playerSelected, selectedPlayer}: DraftPageContentProps) {
  // final submission of bans
  // after all bans are in, move to snake draft page

  const player = (useLoaderData() as {players: Player[]})
    .players.find(player => player.id === selectedPlayer)
  
  const [banCount, setBanCount] = useState(0)
  const [bans, setBans] = useState<string[]>([])
  
  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.currentTarget.checked
    if (checked) {
      if (player?.number_of_bans && banCount >= player?.number_of_bans) {
        event.currentTarget.checked = false
      }
      else {
        setBanCount(banCount + 1)
        setBans([...bans, event.currentTarget.name])
      }
    }
    else {
      setBanCount(banCount - 1)
      setBans(bans.filter(ban => ban !== event.currentTarget.name))
    }
  }
  
  const readyToSubmit = player?.number_of_bans && player.number_of_bans === banCount
  
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
                    <Faction faction={faction} index={index} onCheckboxChange={handleCheckboxChange} />
                  </li>
                ))}
              </ul>
              <button
                disabled={!readyToSubmit}
              >
                {readyToSubmit ? 'Submit Bans' : `(${banCount}/${player?.number_of_bans}) Bans so far`}
              </button>
            </>
          ) : <h2>Select name above to reveal factions to ban</h2>
        }
      </div>
    </>
  )
}

type FactionProps = {
  faction: {wiki: string, id: string, name: string}
  index: number
  onCheckboxChange: ChangeEventHandler<HTMLInputElement>
}

function Faction({faction, index, onCheckboxChange}: FactionProps) {
  if (!faction) return null
  return (
    <>
      <a href={faction.wiki} target="_blank" rel="noopener noreferrer">
        <img src={`images/${faction.id}.jpg`} alt={faction.name} />
      </a>
      <label htmlFor={`ban-${index}`}>Ban</label>
      <input type="checkbox" id={`ban-${index}`} onChange={onCheckboxChange} />
    </>
  )
}
