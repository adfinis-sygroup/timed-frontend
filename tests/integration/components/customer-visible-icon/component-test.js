import { render } from "@ember/test-helpers";
import { setupRenderingTest } from "ember-qunit";
import hbs from "htmlbars-inline-precompile";
import { module, test } from "qunit";

module("Integration | Component | customer visible icon", function(hooks) {
  setupRenderingTest(hooks);

  test("renders", async function(assert) {
    await render(hbs`{{customer-visible-icon}}`);

    assert.dom("i.fa.fa-eye").exists();
  });
});
