/**
 * @module timed
 * @submodule timed-routes
 * @public
 */
import Route from 'ember-route'
import StaffRouteMixin from 'timed/mixins/staff-route'
import ReportFilterRouteMixin from 'timed/mixins/report-filter-route'
import DesktopOnlyRouteMixin from 'timed/mixins/desktop-only-route'
import service from 'ember-service/inject'
import { cleanParams, toQueryString } from 'timed/utils/url'

/**
 * Route for filtering and rescheduling reports
 *
 * @class RescheduleRoute
 * @extends Ember.Route
 * @using StaffRouteMixin
 * @using ReportFilterRouteMixin
 * @public
 */
export default Route.extend(
  StaffRouteMixin,
  ReportFilterRouteMixin,
  DesktopOnlyRouteMixin,
  {
    ajax: service('ajax'),

    /**
   * Model hook, save the current params so we can use them to verify the page
   *
   * @method model
   * @param {Object} params The current params
   * @return {Report[]} The filtered reports
   * @public
   */
    model(params) {
      this.set('params', params)

      return this._super(...arguments)
    },

    actions: {
      /**
     * Save a report row
     *
     * @method saveReport
     * @param {Report} report The report to save
     * @public
     */
      async saveReport(report) {
        try {
          this.send('loading')

          await report.save()
        } catch (e) {
          /* istanbul ignore next */
          this.get('notify').error('Error while saving the report')
        } finally {
          this.send('finished')
        }
      },

      /**
     * Verify the reports matching the current filters
     *
     * We need to reload the model here, since the POST request does not return
     * any data.
     *
     * @method verifyPage
     * @public
     */
      async verifyPage() {
        try {
          this.send('loading')

          let params = this.get('params')

          let queryString = toQueryString(cleanParams(params))

          let url = `/api/v1/reports/verify?${queryString}`

          await this.get('ajax').request(url, { method: 'POST' })

          this.refresh()
        } catch (e) {
          /* istanbul ignore next */
          this.get('notify').error('Error while verifying the page')
        } finally {
          this.send('finished')
        }
      }
    }
  }
)
