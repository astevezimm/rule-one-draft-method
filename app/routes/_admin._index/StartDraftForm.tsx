import {ChangeEvent, MouseEvent, useState} from 'react'
import {useAdmin} from '~/routes/_admin'
import {Form} from '@remix-run/react'

type Map = {
  name: string,
  url: string,
  image?: ArrayBuffer | null
}

export default function StartDraftForm() {
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

  function handleChangeMapImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          const maxSize = 800
          let width = img.width;
          let height = img.height;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (maxSize / width) * height;
              width = maxSize;
            } else {
              width = (maxSize / height) * width;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            async (blob) => {
              if (blob) {
                const arrayBuffer = await blob.arrayBuffer()
                const newMaps = [...maps];
                newMaps[Number((event.target as HTMLInputElement).dataset.index)] = {
                  ...newMaps[Number((event.target as HTMLInputElement).dataset.index)],
                  image: arrayBuffer,
                }
                setMaps(newMaps)
              }
            },
            'image/jpeg',
            0.5
          )
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
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
                <button
                  type="button"
                  onClick={() => document.getElementById(`map-file-${index}`)?.click()}
                  title={map.image ? "Update screenshot" : "Upload a screenshot"}
                >
                  {map.image ? '✅' : '📷'}
                </button>
                <input
                  type="file"
                  id={`map-file-${index}`}
                  style={{ display: 'none' }}
                  accept="image/*"
                  data-index={index}
                  onChange={handleChangeMapImage}
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
