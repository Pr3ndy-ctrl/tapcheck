import assert from "node:assert/strict";
import test from "node:test";
import { contaminantLabel, getContaminant } from "./contaminants";

test("uses verified SDWIS labels and leaves unknown codes unlisted", () => {
  assert.deepEqual(getContaminant("7000"), { name: "Consumer Confidence Report Rule", category: "Public reporting rule" });
  assert.equal(contaminantLabel("9999"), "Unlisted contaminant (code 9999)");
});
