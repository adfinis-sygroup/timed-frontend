/**
 * @module timed
 * @submodule timed-routes
 * @public
 */
import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin'

/**
 * The protected route
 *
 * @class ProtectedRoute
 * @extends Ember.Route
 * @uses EmberSimpleAuth.AuthenticatedRouteMixin
 * @public
 */
export default Route.extend(AuthenticatedRouteMixin, {
  session: service('session'),

  notify: service('notify'),

  autostartTour: service('autostart-tour'),

  tourManager: service('tour-manager'),

  routing: service('-routing'),

  model() {
    let id = this.get('session.data.authenticated.user_id')

    return this.store.findRecord('user', id, {
      include: 'employments,employments.location'
    })
  },

  /**
   * Setup controller hook, evaluate if the welcome modal must be shown
   *
   * @method setupController
   * @param {Ember.Controller} controller The controller
   * @param {User} model The current user
   * @public
   */
  setupController(controller, model) {
    this._super(...arguments)

    let visible =
      !this.get('autostartTour').allDone() &&
      !model.get('tourDone') &&
      (this.get('media.isMd') ||
        this.get('media.isLg') ||
        this.get('media.isXl'))

    controller.set('visible', visible)
  },

  /**
   * Close the current tour
   *
   * @method _closeCurrentTour
   * @private
   */
  _closeCurrentTour() {
    let currentRoute = this.get('routing.router.currentRouteName').replace(
      /\.index$/,
      ''
    )

    if (this.get('autostartTour.tours').includes(currentRoute)) {
      this.controllerFor(currentRoute)
        .get('tour')
        .close()
    }
  },

  /**
   * Actions for the protected route
   *
   * @property {Object} actions
   * @public
   */
  actions: {
    /**
     * Loading action
     *
     * Set loading property on the controller
     *
     * @method loading
     * @param {Ember.Transition} transition The transition which is loading
     * @public
     */
    loading(transition) {
      let controller = this.get('controller')

      if (controller) {
        controller.set('loading', true)
      }

      if (transition) {
        transition.promise.finally(() => {
          transition.send('finished')
        })
      }
    },

    /**
     * Finish the loading animation
     *
     * @method finished
     * @public
     */
    finished() {
      let controller = this.get('controller')

      if (controller) {
        controller.set('loading', false)
      }
    },

    /**
     * Never start the tour, set the tour done property on the current user
     *
     * @method neverTour
     * @public
     */
    async neverTour() {
      try {
        let user = this.get('currentModel')

        user.set('tourDone', true)

        await user.save()

        this._closeCurrentTour()
        this.set('controller.visible', false)
      } catch (e) {
        /* istanbul ignore next */
        this.get('notify').error('Error while saving the user')
      }
    },

    /**
     * Skip the tour for now
     *
     * @method laterTour
     * @public
     */
    laterTour() {
      this._closeCurrentTour()
      this.set('autostartTour.done', this.get('autostartTour.tours'))
      this.set('controller.visible', false)

      this.transitionTo('index.activities')
    },

    /**
     * Start the tour
     *
     * @method startTour
     * @public
     */
    startTour() {
      this.set('autostartTour.done', [])
      this.set('controller.visible', false)

      this.transitionTo('index.activities')
    }
  }
})
