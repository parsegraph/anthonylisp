import { assert } from "chai";
import parse from "../src/index";

describe("Package", function () {
  it("works", () => {
    assert.isNotNull(parse("()"));
  });
});
