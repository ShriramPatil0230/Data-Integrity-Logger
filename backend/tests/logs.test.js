import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../server.js'
import { connectToDatabase } from '../config/db.js'

let mongo
let token

async function authToken() {
  const email = `u${Date.now()}@t.com`
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'pass1234' })
  return res.body.token
}

describe('Logs API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    mongo = await MongoMemoryServer.create()
    process.env.MONGODB_URI = mongo.getUri()
    await connectToDatabase()
    token = await authToken()
  })

  beforeEach(async () => {
    // no-op for now
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it('creates and lists logs (scoped to user) with pagination', async () => {
    const create = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'hello world' })
      .expect(201)
    expect(create.body.hash).toBeDefined()

    const list = await request(app)
      .get('/api/logs?limit=5&page=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(Array.isArray(list.body.items)).toBe(true)
    expect(list.body.total).toBeGreaterThanOrEqual(1)
  })

  it('verifies and deletes a log', async () => {
    const created = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'abc' })
      .expect(201)
    const id = created.body._id

    const verify = await request(app)
      .post(`/api/logs/${id}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(verify.body.verified).toBe(true)

    await request(app)
      .delete(`/api/logs/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
})


