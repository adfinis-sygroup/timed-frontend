/**
 * @module timed
 * @submodule timed-components
 * @public
 */
import Component from '@ember/component'
import { computed } from '@ember/object'
import { inject as service } from '@ember/service'
import hbs from 'htmlbars-inline-precompile'
import { later } from '@ember/runloop'
import customerOptionTemplate from 'timed/templates/customer-option'
import projectOptionTemplate from 'timed/templates/project-option'
import taskOptionTemplate from 'timed/templates/task-option'
import { resolve } from 'rsvp'

const SELECTED_TEMPLATE = hbs`{{selected.name}}`

/**
 * Component for selecting a task, which consists of selecting a customer and
 * project first.
 *
 * @class TaskSelectionComponent
 * @extends Ember.Component
 * @public
 */
export default Component.extend({
  store: service('store'),
  tracking: service('tracking'),

  /**
   * HTML tag name for the component
   *
   * This is an empty string, so we don't have an element of this component in
   * the DOM
   *
   * @property {String} tagName
   * @public
   */
  tagName: '',

  /**
   * Init hook, initially load customers and recent tasks
   *
   * @method init
   * @public
   */
  async init() {
    this._super(...arguments)

    try {
      await this.get('tracking.customers').perform()
      await this.get('tracking.recentTasks').perform()
    } catch (e) {
      /* istanbul ignore next */
      if (e.taskInstance && e.taskInstance.isCanceling) {
        return
      }

      /* istanbul ignore next */
      throw e
    }
  },

  /**
   * Set the initial values when receiving the attributes
   *
   * @method didReceiveAttrs
   * @return {Task|Project|Customer} The setted task, project or customer
   * @public
   */
  didReceiveAttrs() {
    this._super(...arguments)

    this._setInitial()
  },

  _setInitial() {
    let { customer, project, task } = this.getWithDefault('initial', {
      customer: null,
      project: null,
      task: null
    })

    if (task && !this.get('task')) {
      return this.set('task', task)
    }

    if (project && !this.get('project')) {
      return this.set('project', project)
    }

    if (customer && !this.get('customer')) {
      return this.set('customer', customer)
    }
  },

  /**
   * Whether to show archived customers, projects or tasks
   *
   * @property {Boolean} archived
   * @public
   */
  archived: false,

  /**
   * Template for displaying the customer options
   *
   * @property {*} customerOptionTemplate
   * @public
   */
  customerOptionTemplate,

  /**
   * Template for displaying the project options
   *
   * @property {*} projectOptionTemplate
   * @public
   */
  projectOptionTemplate,

  /**
   * Template for displaying the task options
   *
   * @property {*} taskOptionTemplate
   * @public
   */
  taskOptionTemplate,

  /**
   * Template for displaying the selected option
   *
   * @property {*} selectedTemplate
   * @public
   */
  selectedTemplate: SELECTED_TEMPLATE,

  /**
   * The manually selected customer
   *
   * @property {Customer} _customer
   * @private
   */
  _customer: null,

  /**
   * The manually selected project
   *
   * @property {Project} _project
   * @private
   */
  _project: null,

  /**
   * The manually selected task
   *
   * @property {Task} _task
   * @private
   */
  _task: null,

  /**
   * Whether to show history entries in the customer selection or not
   *
   * @property {Boolean} history
   * @public
   */
  history: true,

  /**
   * The selected customer
   *
   * This can be selected manually or automatically, because a task is already
   * set.
   *
   * @property {Customer} customer
   * @public
   */
  customer: computed('_customer', {
    get() {
      return this.get('_customer')
    },
    set(key, value) {
      // It is also possible a task was selected from the history.
      if (value && value.get('constructor.modelName') === 'task') {
        this.set('task', value)

        return value.get('project.customer')
      }

      this.set('_customer', value)

      /* istanbul ignore else */
      if (
        this.get('project') &&
        (!value || value.get('id') !== this.get('project.customer.id'))
      ) {
        this.set('project', null)
      }

      later(this, () => {
        this.getWithDefault('attrs.on-set-customer', () => {})(value)
      })

      return value
    }
  }),

  /**
   * The selected project
   *
   * This can be selected manually or automatically, because a task is already
   * set.
   *
   * @property {Project} project
   * @public
   */
  project: computed('_project', {
    get() {
      return this.get('_project')
    },
    set(key, value) {
      this.set('_project', value)

      if (value && value.get('customer.id')) {
        resolve(value.get('customer')).then(c => {
          this.set('customer', c)
        })
      }

      /* istanbul ignore else */
      if (
        this.get('task') &&
        (value === null || value.get('id') !== this.get('task.project.id'))
      ) {
        this.set('task', null)
      }

      later(this, () => {
        this.getWithDefault('attrs.on-set-project', () => {})(value)
      })

      return value
    }
  }),

  /**
   * The currently selected task
   *
   * @property {Task} task
   * @public
   */
  task: computed('_task', {
    get() {
      return this.get('_task')
    },
    set(key, value) {
      this.set('_task', value)

      if (value && value.get('project.id')) {
        resolve(value.get('project')).then(p => {
          this.set('project', p)
        })
      }

      later(this, async () => {
        this.getWithDefault('attrs.on-set-task', () => {})(value)
      })

      return value
    }
  }),

  /**
   * All customers and recent tasks which are selectable in the dropdown
   *
   * @property {Array} customersAndRecentTasks
   * @public
   */
  customersAndRecentTasks: computed('history', 'archived', async function() {
    let ids = []

    await this.get('tracking.customers.last')

    if (this.get('history')) {
      await this.get('tracking.recentTasks.last')

      let last = this.get('tracking.recentTasks.last.value')

      ids = last ? last.mapBy('id') : []
    }

    let customers = this.get('store')
      .peekAll('customer')
      .filter(c => {
        return this.get('archived') ? true : !c.get('archived')
      })
      .sortBy('name')

    let tasks = this.get('store')
      .peekAll('task')
      .filter(t => {
        return (
          ids.includes(t.get('id')) &&
          (this.get('archived') ? true : !t.get('archived'))
        )
      })

    return [...tasks.toArray(), ...customers.toArray()]
  }),

  /**
   * All projects which are selectable in the dropdown
   *
   * Those depend on the selected customer
   *
   * @property {Project[]} projects
   * @public
   */
  projects: computed('customer.id', 'archived', async function() {
    if (this.get('customer.id')) {
      await this.get('tracking.projects').perform(this.get('customer.id'))
    }

    return this.get('store')
      .peekAll('project')
      .filter(p => {
        return (
          p.get('customer.id') === this.get('customer.id') &&
          (this.get('archived') ? true : !p.get('archived'))
        )
      })
      .sortBy('name')
  }),

  /**
   * All tasks which are selectable in the dropdown
   *
   * Those depend on the selected project
   *
   * @property {Task[]} tasks
   * @public
   */
  tasks: computed('project.id', 'archived', async function() {
    if (this.get('project.id')) {
      await this.get('tracking.tasks').perform(this.get('project.id'))
    }

    return this.get('store')
      .peekAll('task')
      .filter(t => {
        return (
          t.get('project.id') === this.get('project.id') &&
          (this.get('archived') ? true : !t.get('archived'))
        )
      })
      .sortBy('name')
  }),

  actions: {
    /**
     * Clear all comboboxes
     *
     * @method clear
     * @public
     */
    clear() {
      this.setProperties({
        customer: null,
        project: null,
        task: null
      })
    },

    reset() {
      this.send('clear')

      this._setInitial()
    }
  }
})
