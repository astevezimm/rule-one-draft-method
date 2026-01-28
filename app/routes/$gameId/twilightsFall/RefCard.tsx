import {TFFaction} from '~/global'

type RefCardProps = {
  faction: TFFaction
  onSelect?: (factionId: string) => void
  selected?: boolean
}

export default function RefCard({faction, onSelect, selected} : RefCardProps) {
  const className = `ref-card ${onSelect ? "ref-card-selectable" : ""} ${selected ? "ref-card-selected" : ""}`
  
  return (
    <li
      key={faction.id} className={className}
      onClick={() => onSelect && onSelect(faction.id)}
    >
      <h3>{faction.name}</h3>
      <p className="initiative">Initiative: <span>{faction.priority}</span></p>
      {faction.id === 'keleres' ? (
          <div className="start-system-keleres" />
        ) : (
          <img
            src={`images/startSystems/ST_${faction.startSystem.img}.webp`}
            alt={faction.startSystem.alt}
          />
        )
      }
      <h4>Starting Units:</h4>
      <div className="start-units">
        {Object.keys(faction.startUnits).map((unit) => (
          <p key={`${faction.id}-${unit}`}>{unit}: {(faction.startUnits as any)[unit]}</p>
        ))}
      </div>
    </li>
  )
}