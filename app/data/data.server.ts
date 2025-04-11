import {config} from 'dotenv'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {Player, Map} from '~/global'

config()
mongoose.connect(process.env.DB_URL as string)

const gameSchema = new mongoose.Schema({
  gameId: { type: String, default: uuidv4 },
  players: Array,
  maps: Array,
  state: String,
  base: Boolean,
  pok: Boolean,
  keleres: Boolean,
  ds: Boolean,
  dsplus: Boolean,
  factionPoolSize: Number
})

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema)

export async function startDraft(data: Record<string, any>) {
  const players: Player[] = []
  const maps: Map[] = []

  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('player-')) {
      players.push({ name: value.toString(), mapVote: -1, id: uuidv4() })
    } else if (key.startsWith('map-name-')) {
      const index = +key.split('-')[2];
      maps[index] = maps[index] || { name: '', url: '', votes: 0 }
      maps[index].name = value.toString()
    } else if (key.startsWith('map-url-')) {
      const index = +key.split('-')[2];
      maps[index] = maps[index] || { name: '', url: '', votes: 0 }
      maps[index].url = value.toString()
    }
  })
  
  const gameData = {
    players,
    maps,
    state: maps.length > 1 ? "voting" : (+data.factionPoolSize > players.length ? "banning" : "drafting"),
    base: !!data.base,
    pok: !!data.pok,
    keleres: !!data.keleres,
    ds: !!data.ds,
    dsplus: !!data.dsplus,
    factionPoolSize: +data.factionPoolSize
  }
  
  const game = new Game(gameData)
  await game.save()
  return game.gameId
}

export async function loadDraft(gameId: string | undefined) {
  const game = await Game.findOne({ gameId })
  if (!game) return null
  return {
    players: game.players,
    maps: game.maps,
    state: game.state,
    base: game.base,
    pok: game.pok,
    keleres: game.keleres,
    ds: game.ds,
    dsplus: game.dsplus,
    factionPoolSize: game.factionPoolSize,
    gameId
  }
}
