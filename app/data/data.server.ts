import {config} from 'dotenv'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {Player, Map} from '~/global'

config()
mongoose.connect(process.env.DB_URL as string)

const gameSchema = new mongoose.Schema({
  gameId: { type: String, default: uuidv4 },
  players: Array,
  maps: [{ name: String, url: String, votes: Number, image: { type: Buffer, default: null } }],
  state: String,
  base: Boolean,
  pok: Boolean,
  keleres: Boolean,
  ds: Boolean,
  dsplus: Boolean,
  factionPoolSize: Number,
  initiativeSet: Boolean
})

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema)

export async function startDraft(data: Record<string, any>) {
  const players: Player[] = []
  const maps: Map[] = []

  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('player-')) {
      players.push({ name: value.toString(), mapVote: -1, id: uuidv4() })
    } else if (key.startsWith('map-name-')) {
      const index = +key.split('-')[2]
      maps[index] = maps[index] || { name: '', url: '', votes: 0, image: null }
      maps[index].name = value.toString()
    } else if (key.startsWith('map-url-')) {
      const index = +key.split('-')[2]
      maps[index] = maps[index] || { name: '', url: '', votes: 0, image: null }
      maps[index].url = value.toString()
    } else if (key.startsWith('map-image-')) {
      const index = +key.split('-')[2]
      maps[index] = maps[index] || {name: '', url: '', votes: 0, image: null}
      maps[index].image = Buffer.from(value as string, 'base64')
    }
  })
  
  const state = maps.length > 1 ? "voting" : (+data.factionPoolSize > players.length ? "banning" : "drafting")
  
  if (state !== 'voting') players.sort(() => Math.random() - 0.5)
  
  const gameData = {
    players,
    maps,
    state,
    base: !!data.base,
    pok: !!data.pok,
    keleres: !!data.keleres,
    ds: !!data.ds,
    dsplus: !!data.dsplus,
    factionPoolSize: +data.factionPoolSize,
    initiativeSet: state !== 'voting'
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

export async function removeDraft(gameId: string | undefined) {
  const game = await Game.findOne({gameId})
  if (!game) return
  await Game.deleteOne({gameId})
}

export async function updateMapImage(gameId: string | undefined, index: number, image: ArrayBuffer) {
  const game = await Game.findOne({ gameId })
  if (!game) return
  if (index < 0 || index >= game.maps.length) return
  game.maps[index].image = image
  await game.save()
}

export async function vote(gameId: string | undefined, player: Player, mapIndex: number) {
  const game = await Game.findOne({gameId})
  if (!game) return
  if (game.state !== 'voting') return
  
  const map = game.maps[mapIndex]
  if (!map) return
  map.votes++
  
  if (player.mapVote >= 0) {
    const previousMap = game.maps[player.mapVote]
    if (previousMap) previousMap.votes--
  }
  player.mapVote = mapIndex
  game.players[game.players.findIndex((p: Player) => p.id === player.id)] = player
  
  await game.save()
}
  

export async function setInitiative(gameId: string | undefined) {
  const game = await Game.findOne({ gameId })
  if (!game || game.initiativeSet) return
  game.initiativeSet = true
  game.players.sort(() => Math.random() - 0.5)
  await game.save()
}
