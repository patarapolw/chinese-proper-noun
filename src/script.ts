/// <reference path="./declaration.d.ts" />
import pinyin from 'chinese-to-pinyin'
import XRegExp from 'xregexp'
import fs from 'fs'
import yaml from 'js-yaml'
import glob from 'fast-glob'

const toneMap: {
  [k: string]: {
    pinyin: string
    hanzi: {
      [h: string]: string[]
    }
  }
} = {}

glob.sync('input/**/*.md').map((f) => {
  XRegExp.forEach(fs.readFileSync(f, 'utf8'), XRegExp('\\p{Han}+'), ([v]) => {
    v.split('').forEach((c) => {
      const tone = pinyin(c, { toneToNumber: true })
      toneMap[tone] = toneMap[tone] || {
        pinyin: tone,
        hanzi: {}
      }
      toneMap[tone].hanzi[c] = toneMap[tone].hanzi[c] || []
      toneMap[tone].hanzi[c].push(v)
    })
  })
})

fs.writeFileSync('output/tone.yaml', yaml.safeDump(Object.entries(toneMap).sort((a, b) => {
  return a[0].localeCompare(b[0])
}).map(([_, v]) => {
  const { hanzi } = v
  v.hanzi = {}
  for (const [k1, v1] of Object.entries(hanzi)) {
    v.hanzi[k1] = Array.from(new Set(v1))
  }
  return v
})))
