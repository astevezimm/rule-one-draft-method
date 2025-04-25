import {ChangeEvent, MouseEvent, useState} from 'react'
import {Form} from '@remix-run/react'
import {ActionFunctionArgs, redirect} from '@remix-run/node'
import {startDraft} from '~/data/data.server'
import {pageHeading} from '~/global'
import {useAdmin} from '~/routes/_admin'
import { LinksFunction } from "@remix-run/node"
import styles from "./start_page.css?url"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData()
  const body = Object.fromEntries(formData.entries())
  const gameId = await startDraft(body)
  return redirect(`/${gameId}`)
}

type Map = {
  name: string,
  url: string,
}

export default function StartPage() {
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""])
  const [maps, setMaps] = useState<Map[]>([{name: "Map 1", url: ""}])
  const [checkboxError, setCheckboxError] = useState<string | null>(null)
  const {setAdmin} = useAdmin()
  
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
  
  function handleChangeMapName(event: ChangeEvent<HTMLInputElement>) {
    const newMaps = [...maps]
    newMaps[Number(event.target.dataset.index)] = {
      ...newMaps[Number(event.target.dataset.index)], name: event.target.value
    }
    setMaps(newMaps)
  }
  
  function handleChangeMapUrl(event: ChangeEvent<HTMLInputElement>) {
    const newMaps = [...maps]
    newMaps[Number(event.target.dataset.index)] = {
      ...newMaps[Number(event.target.dataset.index)], url: event.target.value
    }
    setMaps(newMaps)
  }
  
  function handleRemoveMap(event: MouseEvent<HTMLButtonElement>) {
    const newMaps = [...maps]
    newMaps.splice(Number((event.target as HTMLButtonElement).dataset.index), 1)
    setMaps(newMaps)
  }
  
  function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    if (!validateCheckboxes(event)) return
    setAdmin(true)
  }

  function validateCheckboxes(event: MouseEvent<HTMLButtonElement>) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#keleres)')
    const isChecked = Array.from(checkboxes).some(checkbox => (checkbox as HTMLInputElement).checked)
    if (!isChecked) {
      event.preventDefault()
      setCheckboxError('At least one race type must be selected beyond Keleres.')
      return false
    }
    else {
      if (checkboxError) setCheckboxError(null)
      return true
    }
  }
  
  return (
    <>
      <h1>{pageHeading}</h1>
      <Form method="post">
        <h2>Players</h2>
        <section>
          <ul>
            {playerNames.map((name, index) => {
              const id = `player-${index}`
              return (
                <li key={id}>
                  <label htmlFor={id}>Player {index + 1}</label>
                  <input
                    type="text"
                    id={id}
                    name={id}
                    value={name}
                    data-index={index}
                    onChange={handleChangePlayerName}
                    required
                    placeholder={index === 0 ? "Admin: your name here." : ""}
                  />
                  {index >= 3 && (
                    <button type="button" data-index={index} onClick={handleRemovePlayer}>
                      Remove
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          {playerNames.length < 8 && (
            <button type="button" className="add" onClick={() => setPlayerNames([...playerNames, ""])}>
              Add Player
            </button>
          )}
        </section>
        
        <h2>Included Factions</h2>
        <section className="factions">
          {checkboxError && <p style={{color: 'red'}}>{checkboxError}</p>}
          <IncludeRaceType name='Base' id='base' />
          <IncludeRaceType name='Prohecy of Kings' id='pok' />
          <IncludeRaceType name='Keleres' id='keleres' />
          <IncludeRaceType name='Discordant Stars' id='ds' />
          <IncludeRaceType name='Discordant Stars Plus' id='dsplus' />
        </section>
        
        <h2>Faction Drafting Pool Size</h2>
        <input type="number" min={playerNames.length} name="factionPoolSize" required />

        <h2>Maps</h2>
        <section>
          <a href="https://keeganw.github.io/ti4/" target="_blank">
            Generate maps here and paste the links below
          </a>
          <ul>
            {maps.map((map, index) => (
              <li key={`map-${index}`} className="map">
                <label htmlFor={`map-name-${index}`}>Name</label>
                <input
                  type="text"
                  id={`map-name-${index}`}
                  name={`map-name-${index}`}
                  value={map.name}
                  data-index={index}
                  onChange={handleChangeMapName}
                  required
                />
                <label htmlFor={`map-url-${index}`}>URL</label>
                <input
                  type="text"
                  id={`map-url-${index}`}
                  name={`map-url-${index}`}
                  value={map.url}
                  data-index={index}
                  onChange={handleChangeMapUrl}
                  required
                />
                {index >= 1 && (
                  <button type="button" data-index={index} onClick={handleRemoveMap}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button" className="add"
            onClick={() => setMaps([...maps, {name: `Map ${maps.length + 1}`, url: ""}])}
          >
            Add Map
          </button>
        </section>

        <button type='submit' onClick={handleSubmit}>Start Draft</button>
      </Form>
    </>
  )
}

function IncludeRaceType({name, id}: {name: string, id: string}) {
  return (
    <label htmlFor={id}>
      {name}
      <input type="checkbox" id={id} name={id} />
    </label>
  )
}
