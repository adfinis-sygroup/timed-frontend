import { visit, settled } from "@ember/test-helpers";
import { setupMirage } from "ember-cli-mirage/test-support";
import { setupApplicationTest } from "ember-qunit";
import { authenticateSession } from "ember-simple-auth/test-support";
import { module, test } from "qunit";

module("Acceptance | external employee", function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = this.server.create("user");
    this.user = user;

    // eslint-disable-next-line camelcase
    await authenticateSession({ user_id: user.id });

    // get active employment and set it to isExternal
    const activeEmployment = this.user.employments.filter(e => e.end === null);
    activeEmployment.update({ isExternal: true });
  });

  test("cant view statistics", async function(assert) {
    await visit("/statistics");

    await settled();

    assert.dom("h1").includesText("Access forbidden");
    assert
      .dom("h4")
      .includesText("You do not have the permission to access this page");
  });

  test("cant view analysis", async function(assert) {
    await visit("/analysis");

    await settled();

    assert.dom("h1").includesText("Access forbidden");
    assert
      .dom("h4")
      .includesText("You do not have the permission to access this page");
  });

  test("cant add absence", async function(assert) {
    await visit("/");

    assert.dom("[data-test-add-absence]").isDisabled();
  });

  test("can only view tracking in top navigation", async function(assert) {
    await visit("/");

    assert.dom("section > ul > li").exists({ count: 3 });
    assert.dom("section > ul > li").includesText("Tracking");
  });

  test("cant view balances", async function(assert) {
    await visit(`/users/${this.user.id}`);

    assert.dom("[user-header-worktime-balance-container]").doesNotExist();

    assert.dom("[user-header-absence-balance-container]").doesNotExist();
  });
});
