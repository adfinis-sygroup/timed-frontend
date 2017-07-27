/**
 * @module timed
 * @submodule timed-controllers
 * @public
 */
import Controller from 'ember-controller'
import computed from 'ember-computed-decorators'

/**
 * The index activities controller
 *
 * @class IndexActivitiesController
 * @extends Ember.Controller
 * @public
 */
export default Controller.extend({
  /**
   * All activities currently in the store
   *
   * @property {Activity[]} _allActivities
   * @private
   */
  @computed()
  _allActivities() {
    return this.store.peekAll('activity')
  },

  /**
   * The activities filtered by the selected day
   *
   * @property {Activity[]} activities
   * @public
   */
  @computed('_allActivities.@each.{isNew,isDeleted}', 'model')
  activities(activities, day) {
    return activities.filter(a => {
      return (
        a.get('start').isSame(day, 'day') &&
        !a.get('isNew') &&
        !a.get('isDeleted')
      )
    })
  }
})
