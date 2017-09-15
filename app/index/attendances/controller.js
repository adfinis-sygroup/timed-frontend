/**
 * @module timed
 * @submodule timed-controllers
 * @public
 */
import Controller from '@ember/controller'
import computed from 'ember-computed-decorators'
import AttendanceValidator from 'timed/validations/attendance'

/**
 * The index attendances controller
 *
 * @class IndexAttendancesController
 * @extends Ember.Controller
 * @public
 */
export default Controller.extend({
  AttendanceValidator,

  /**
   * All attendances currently in the store
   *
   * @property {Attendance[]} _allAttendances
   * @private
   */
  @computed()
  _allAttendances() {
    return this.store.peekAll('attendance')
  },

  /**
   * The attendances filtered by the selected day
   *
   * @property {Attendance[]} attendances
   * @public
   */
  @computed('_allAttendances.@each.{date,user,isDeleted}', 'model', 'user')
  attendances(attendances, date, user) {
    return attendances.filter(a => {
      return (
        a.get('date').isSame(date, 'day') &&
        a.get('user.id') === user.get('id') &&
        !a.get('isDeleted')
      )
    })
  }
})
