/**
 * @module timed
 * @submodule timed-controllers
 * @public
 */
import Controller from 'ember-controller'
import computed from 'ember-computed-decorators'
import moment from 'moment'

/**
 * Controller to edit an activity
 *
 * @class IndexActivitiesEditController
 * @extends Ember.Controller
 * @public
 */
const IndexActivitiesEditController = Controller.extend({
  /**
   * The total duration of all inactive blocks
   *
   * @property {moment.duration} total
   * @public
   */
  @computed('blocks.@each.{from,to,isDeleted}')
  total(blocks) {
    return blocks.filterBy('isDeleted', false).reduce((dur, block) => {
      let { from, to } = block.getProperties('from', 'to')

      if (to) {
        dur.add(to.diff(from))
      }

      return dur
    }, moment.duration())
  },

  /**
   * Whether the save button is enabled
   *
   * This is true if the activity and all its block is valid and there are some
   * kind of changes on the activity or its blocks
   *
   * @property {Boolean} saveEnabled
   * @public
   */
  @computed(
    'blocks.@each.{isValid,isDirty,isDeleted}',
    'activity.{isValid,isDirty}'
  )
  saveEnabled(blocks, activityValid, activityDirty) {
    return (
      (activityDirty ||
        blocks.some(b => b.get('isDirty') || b.get('isDeleted'))) &&
      activityValid &&
      blocks.every(b => b.get('isDeleted') || b.get('isValid'))
    )
  },

  actions: {
    /**
     * Validate the given changeset
     *
     * @method validateChangeset
     * @param {EmberChangeset.Changeset} changeset The changeset to validate
     * @public
     */
    validateChangeset(changeset) {
      changeset.validate()
    }
  }
})

export default IndexActivitiesEditController
