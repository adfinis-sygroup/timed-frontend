/**
 * @module timed
 * @submodule timed-models
 * @public
 */
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";

/**
 * The employment model
 *
 * @class Employment
 * @extends DS.Model
 * @public
 */
export default Model.extend({
  /**
   * The percentage
   *
   * @property {Number} percentage
   * @public
   */
  percentage: attr("number"),

  /**
   * The time the user has to work every day
   *
   * @property {moment.duration} worktimePerDay
   * @public
   */
  worktimePerDay: attr("django-duration"),

  /**
   * The start date
   *
   * @property {moment} start
   * @public
   */
  start: attr("django-date"),

  /**
   * Whether the user is an external employee
   *
   * @property {Boolean} isExternal
   * @public
   */
  isExternal: attr("boolean", { defaultValue: false }),

  /**
   * The end date
   *
   * @property {moment} end
   * @public
   */
  end: attr("django-date"),

  /**
   * The employed user
   *
   * @property {User} user
   * @public
   */
  user: belongsTo("user"),

  /**
   * The work location
   *
   * @property {Location} location
   * @public
   */
  location: belongsTo("location")
});
