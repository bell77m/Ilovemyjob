// Server-only: reads the shared JSON next to mcp_server.py and builds the engine once.
import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { createEngine, type Config } from './core'

// Repo root holds prompts.json + cringe.json. Docker sets ILMJ_ROOT; locally we run from frontend/.
const root = process.env.ILMJ_ROOT ?? (basename(process.cwd()) === 'frontend' ? join(process.cwd(), '..') : process.cwd())
const read = (f: string) => JSON.parse(readFileSync(join(root, f), 'utf8'))

const prompts = read('prompts.json')
export const cfg: Config = { ...prompts, ollama: process.env.OLLAMA_HOST ?? prompts.ollama }
export const engine = createEngine({ fetch, cfg, corpus: read('cringe.json') })
