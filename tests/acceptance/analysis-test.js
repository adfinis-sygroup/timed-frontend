import {
  authenticateSession,
  invalidateSession
} from 'timed/tests/helpers/ember-simple-auth'
import { describe, it, beforeEach, afterEach } from 'mocha'
import destroyApp from '../helpers/destroy-app'
import { expect } from 'chai'
import startApp from '../helpers/start-app'
import testSelector from 'ember-test-selectors'

describe('Acceptance | analysis', function() {
  let application

  beforeEach(async function() {
    application = startApp()

    let user = server.create('user')

    // eslint-disable-next-line camelcase
    await authenticateSession(application, { user_id: user.id })

    server.createList('report', 6)
  })

  afterEach(async function() {
    await invalidateSession(application)
    destroyApp(application)
  })

  it('can visit /analysis', async function() {
    await visit('/analysis')

    expect(currentURL()).to.equal('/analysis')
  })

  it('can search and download file', async function() {
    await visit('/analysis')
    await userSelect(testSelector('filter-user'))
    await click(testSelector('filter-apply'))

    expect(find(`${testSelector('filter-results')} tbody tr`).length).to.equal(
      6
    )

    await click(testSelector('download-file', 0))
    expect(currentURL()).to.equal('/analysis?user=1')
  })

  it('can reset the search params', async function() {
    await visit('/analysis')
    await userSelect(testSelector('filter-user'))
    await taskSelect(testSelector('filter-customer'), { fromHistory: true })

    await click(testSelector('filter-apply'))

    expect(currentURL()).to.equal('/analysis?customer=1&user=1')

    await click(testSelector('filter-reset'))

    expect(currentURL()).to.equal('/analysis')
  })
})
