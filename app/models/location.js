/**
 * @module timed
 * @submodule timed-models
 * @public
 */
import attr from "ember-data/attr";
import Model from "ember-data/model";

/**
 * The location model
 *
 * @class Location
 * @extends DS.Model
 * @public
 */
export default Model.extend({
  /**
   * The name
   *
   * @property {String} name
   * @public
   */
  name: attr("string"),

  /**
   * The days on which users in this location need to work
   *
   * @property {Number[]} workdays
   * @public
   */
  workdays: attr("django-workdays")
});
