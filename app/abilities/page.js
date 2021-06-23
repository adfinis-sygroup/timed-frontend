import { not } from "@ember/object/computed";
import { Ability } from "ember-can";

export default Ability.extend({
  canAccess: not("user.activeEmployment.isExternal")
});
