import {ChangeEvent, MouseEvent, useState} from 'react'
import {Form} from '@remix-run/react'
import UploadScreenshot from '~/components/UploadScreenshot'
import {Buffer} from 'buffer'
import {extractMapImage} from '~/global'

type Map = {
  name: string,
  url: string,
  image?: ArrayBuffer | null
}

export default function StartDraftForm() {
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""])
  const [maps, setMaps] = useState<Map[]>([{name: "Map 1", url: ""}])
  const [checkboxError, setCheckboxError] = useState<string | null>(null)

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

  async function handleChangeMapImage(event: ChangeEvent<HTMLInputElement>) {
    const arrayBuffer = await extractMapImage(event.target.files?.[0]) as ArrayBuffer | null
    const newMaps = [...maps];
    newMaps[Number((event.target as HTMLInputElement).dataset.index)] = {
      ...newMaps[Number((event.target as HTMLInputElement).dataset.index)],
      image: arrayBuffer,
    }
    setMaps(newMaps)
  }

  function handleRemoveMap(event: MouseEvent<HTMLButtonElement>) {
    const newMaps = [...maps]
    newMaps.splice(Number((event.target as HTMLButtonElement).dataset.index), 1)
    setMaps(newMaps)
  }

  function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!validateCheckboxes(event)) return

    const form = event.currentTarget.closest('form') as HTMLFormElement
    const formData = new FormData(form)
    formData.set('customField', 'customValue')
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i]
      if (map.image) {
        formData.append(`map-image-${i}`, Buffer.from(map.image).toString('base64'))
      }
    }

    fetch(form.action, {
      method: form.method,
      body: formData,
    }).then(response => {
      if (response.redirected) {
        window.location.href = response.url
        localStorage.setItem('admin', response.url.slice(-36))
      }
    })
  }

  function validateCheckboxes(event: MouseEvent<HTMLButtonElement>) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#keleres)')
    const isChecked = Array.from(checkboxes).some(checkbox => (checkbox as HTMLInputElement).checked)
    if (!isChecked) {
      setCheckboxError('At least one race type must be selected beyond Keleres.')
      return false
    }
    else {
      if (playerNames.length === 8) {
        const notPok = document.querySelectorAll('input[type="checkbox"]:not(#pok)')
        const beyondPokChecked = Array.from(notPok).some(checkbox => (checkbox as HTMLInputElement).checked)
        if (!beyondPokChecked) {
          setCheckboxError('For 8 players, more than just POK factions must be selected.')
          return false
        }
      }
      if (checkboxError) setCheckboxError(null)
      return true
    }
  }

  return (
    <>
      <Form method="post" className="card">
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
          <ul className="maps">
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
                <UploadScreenshot
                  image={map.image}
                  index={index}
                  onChangeImage={handleChangeMapImage}
                />
                {index >= 1 && (
                  <button type="button" data-index={index} onClick={handleRemoveMap} className="remove-map">
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

        <button className="start-draft-btn" type='submit' onClick={handleSubmit}>Start Draft</button>
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
