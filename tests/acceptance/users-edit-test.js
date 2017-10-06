import {
  authenticateSession,
  invalidateSession
} from 'timed/tests/helpers/ember-simple-auth'
import { describe, it, beforeEach, afterEach } from 'mocha'
import destroyApp from '../helpers/destroy-app'
import { expect } from 'chai'
import startApp from '../helpers/start-app'

describe('Acceptance | users edit', function() {
  let application

  beforeEach(async function() {
    application = startApp()

    let user = server.create('user')

    this.allowed = server.create('user', { supervisorIds: [user.id] })
    this.notAllowed = server.create('user')

    // eslint-disable-next-line camelcase
    await authenticateSession(application, { user_id: user.id })
  })

  afterEach(async function() {
    await invalidateSession(application)
    destroyApp(application)
  })

  it('can visit /users/:id', async function() {
    await visit(`/users/${this.allowed.id}`)

    expect(currentURL()).to.contain(this.allowed.id)
  })

  it('shows only supervisees to staff', async function() {
    await visit(`/users/${this.notAllowed.id}`)

    expect(currentURL()).to.not.contain(this.notAllowed.id)
  })

  it('allows all to superuser', async function() {
    let user = server.create('user', { isSuperuser: true })

    // eslint-disable-next-line camelcase
    await authenticateSession(application, { user_id: user.id })

    await visit(`/users/${this.notAllowed.id}`)

    expect(currentURL()).to.contain(this.notAllowed.id)
  })
})
