import crypto from 'crypto'

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

export function buildMerkleRoot(hexLeaves) {
  if (!hexLeaves || hexLeaves.length === 0) return null
  let level = hexLeaves.map((h) => h.toLowerCase())
  while (level.length > 1) {
    const next = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = i + 1 < level.length ? level[i + 1] : level[i]
      next.push(sha256Hex(left + right))
    }
    level = next
  }
  return level[0]
}

export function buildMerkleProof(hexLeaves, targetIndex) {
  const path = []
  let level = hexLeaves.map((h) => h.toLowerCase())
  let index = targetIndex
  while (level.length > 1) {
    const isRight = index % 2 === 1
    const siblingIndex = isRight ? index - 1 : Math.min(index + 1, level.length - 1)
    path.push({ sibling: level[siblingIndex], position: isRight ? 'left' : 'right' })
    // build next level
    const next = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = i + 1 < level.length ? level[i + 1] : level[i]
      next.push(sha256Hex(left + right))
    }
    level = next
    index = Math.floor(index / 2)
  }
  return path
}

export function verifyProof(leaf, root, proof) {
  let hash = leaf.toLowerCase()
  for (const step of proof) {
    hash = step.position === 'left'
      ? sha256Hex(step.sibling + hash)
      : sha256Hex(hash + step.sibling)
  }
  return hash === root.toLowerCase()
}


