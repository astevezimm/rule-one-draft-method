import {ChangeEvent, MouseEvent, useState} from 'react'

export default function StartPage() {
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""])
  
  function handleChangePlayerName(event: ChangeEvent<HTMLInputElement>) {
    const newNames = [...playerNames]
    newNames[Number(event.target.dataset.index)] = event.target.value
    setPlayerNames(newNames)
  }
  
  function handleRemovePlayer(event: MouseEvent<HTMLButtonElement>) {
    const newNames = [...playerNames]
    newNames.splice(Number((event.target as HTMLButtonElement).dataset.index), 1)
    setPlayerNames(newNames)
  }
  
  return (
    <>
      <h1>Welcome to the Rule One Draft Method</h1>
      <form>
        <h2>Players</h2>
        <ul>
          {playerNames.map((name, index) => (
            <li key={index}>
              <label htmlFor={`player-${index}`}>Player {index + 1}</label>
              <input
                type="text"
                id={`player-${index}`}
                value={name}
                data-index={index}
                onChange={handleChangePlayerName}
              />
              {index >= 3 && (
                <button type="button" data-index={index} onClick={handleRemovePlayer}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        {playerNames.length < 8 && (
          <button type="button" onClick={() => setPlayerNames([...playerNames, ""])}>
            Add Player
          </button>
        )}
        
        <h2>Included Factions</h2>
        <IncludeRaceType name='Base' id='base' />
        <IncludeRaceType name='Prohecy of Kings' id='pok' />
        <IncludeRaceType name='Keleres' id='keleres' />
        <IncludeRaceType name='Discordant Stars' id='ds' />
        <IncludeRaceType name='Discordant Stars Plus' id='dsplus' />
        
        <label htmlFor="poolsize">Faction Drafting Pool Size</label>
        <input type="number" min={playerNames.length} />

        {/* integrate with https://keeganw.github.io/ti4/:
          names(default to Map 1, Map 2, etc.) and urls for map choices
        */}

        <button type='submit'>Start Draft</button>
      </form>
    </>
  )
}

function IncludeRaceType({name, id}: {name: string, id: string}) {
  return (
    <label htmlFor={id}>
      {name}
      <input type="checkbox" id={id} />
    </label>
  )
}
