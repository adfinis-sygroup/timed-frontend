import {
  click,
  fillIn,
  currentURL,
  visit,
  find,
  settled
} from "@ember/test-helpers";
import { setupMirage } from "ember-cli-mirage/test-support";
import { setupApplicationTest } from "ember-qunit";
import { authenticateSession } from "ember-simple-auth/test-support";
import moment from "moment";
import { module, test } from "qunit";

module("Acceptance | statistics", function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = this.server.create("user");
    this.user = user;

    // eslint-disable-next-line camelcase
    await authenticateSession({ user_id: user.id });

    this.server.createList("year-statistic", 5);
    this.server.createList("month-statistic", 5);
    this.server.createList("customer-statistic", 5);
    this.server.createList("project-statistic", 5);
    this.server.createList("task-statistic", 5);
    this.server.createList("user-statistic", 5);
  });

  test("can view statistics by year", async function(assert) {
    await visit("/statistics");

    await settled();

    assert.dom("thead > tr > th").exists({ count: 3 });
    assert.dom("tbody > tr").exists({ count: 5 });
    assert.dom("tfoot").includesText("Total");
  });

  test("can view statistics by month", async function(assert) {
    await visit("/statistics?type=month");

    await settled();

    assert.dom("thead > tr > th").exists({ count: 4 });
    assert.dom("tbody > tr").exists({ count: 5 });
    assert.dom("tfoot").includesText("Total");
  });

  test("can view statistics by customer", async function(assert) {
    await visit("/statistics?type=customer");

    await settled();

    assert.dom("thead > tr > th").exists({ count: 3 });
    assert.dom("tbody > tr").exists({ count: 5 });
    assert.dom("tfoot").includesText("Total");
  });

  test("can view statistics by project", async function(assert) {
    await visit("/statistics?type=project&customer=1");

    await settled();

    assert.dom("thead > tr > th").exists({ count: 5 });
    assert.dom("tbody > tr").exists({ count: 5 });
    assert.dom("tfoot").includesText("Total");
  });

  test("can view statistics by task", async function(assert) {
    await visit("/statistics?type=task&customer=1&project=1");

    await settled();

    assert.dom("thead > tr > th").exists({ count: 6 });
    assert.dom("tbody > tr").exists({ count: 5 });
    assert.dom("tfoot").includesText("Total");
  });

  test("can view statistics by user", async function(assert) {
    await visit("/statistics?type=user");

    await settled();

    assert.dom("thead > tr > th").exists({ count: 3 });
    assert.dom("tbody > tr").exists({ count: 5 });
    assert.dom("tfoot").includesText("Total");
  });

  test("can filter and reset filter", async function(assert) {
    await visit("/statistics");

    await settled();

    const from = moment();
    const to = moment().subtract(10, "days");

    await fillIn(
      "[data-test-filter-from-date] input",
      from.format("DD.MM.YYYY")
    );
    await fillIn("[data-test-filter-to-date] input", to.format("DD.MM.YYYY"));

    assert.ok(currentURL().includes(`fromDate=${from.format("YYYY-MM-DD")}`));
    assert.ok(currentURL().includes(`toDate=${to.format("YYYY-MM-DD")}`));

    await click(".filter-sidebar-reset");

    assert.notOk(currentURL().includes(`fromDate=${from}`));
    assert.notOk(currentURL().includes(`toDate=${to}`));
  });

  test("shows missing parameters message", async function(assert) {
    await visit("/statistics?type=task");

    await settled();

    assert
      .dom(".empty")
      .includesText("Customer and project are required parameters");
  });

  test("resets ordering on type change", async function(assert) {
    await visit("/statistics?type=month&ordering=year");

    await settled();

    await click(".nav-tabs li a:first-child");

    assert.notOk(
      currentURL().includes("Customer and project are required parameters")
    );
  });

  test("can have initial filters", async function(assert) {
    await this.server.createList("billing-type", 3);

    const params = {
      customer: 1,
      project: 1,
      task: 1,
      user: 1,
      reviewer: 1,
      billingType: 1,
      fromDate: moment()
        .subtract(10, "days")
        .format("YYYY-MM-DD"),
      toDate: moment().format("YYYY-MM-DD"),
      review: 1,
      notBillable: 0,
      verified: 0
    };

    await visit(
      `/statistics?${Object.keys(params)
        .map(k => `${k}=${params[k]}`)
        .join("&")}`
    );

    await settled();

    assert
      .dom("[data-test-filter-customer] .ember-power-select-selected-item")
      .exists();

    assert
      .dom("[data-test-filter-project] .ember-power-select-selected-item")
      .exists();

    assert
      .dom("[data-test-filter-task] .ember-power-select-selected-item")
      .exists();

    assert
      .dom("[data-test-filter-user] .ember-power-select-selected-item")
      .exists();

    assert
      .dom("[data-test-filter-reviewer] .ember-power-select-selected-item")
      .exists();

    assert.equal(
      find("[data-test-filter-billing-type] select").options.selectedIndex,
      1
    );

    assert.dom("[data-test-filter-from-date] input").exists();

    assert.dom("[data-test-filter-to-date] input").exists();

    assert.dom("[data-test-filter-review] .btn.active").exists();
    assert.dom("[data-test-filter-not-billable] .btn.active").exists();
    assert.dom("[data-test-filter-verified] .btn.active").exists();
  });
});
