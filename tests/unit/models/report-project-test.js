import { expect } from 'chai'
import { describe, it } from 'mocha'
import { setupModelTest } from 'ember-mocha'

describe('Unit | Model | report project', function() {
  setupModelTest('report-project', {
    // Specify the other units that are required for this test.
    needs: ['model:project']
  })

  // Replace this with your real tests.
  it('exists', function() {
    let model = this.subject()
    // var store = this.store();
    expect(model).to.be.ok
  })
})
