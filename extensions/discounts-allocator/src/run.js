/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

const EMPTY_RESULT = {
  displayableErrors: [],
  lineDiscounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const { cart, discounts } = input;
  const { lines } = cart;

  const lineDiscounts = lines.map((line) => {
    return {
      lineId: line.id,
      value: 0,
    };
  });

  console.log("Discounts", JSON.stringify(discounts, null, 2));
  console.log("Lines", JSON.stringify(lines, null, 2));
  console.log("Line discounts", JSON.stringify(lineDiscounts, null, 2));
  console.log("Cart", JSON.stringify(cart, null, 2));


  return {
    ...EMPTY_RESULT,
    lineDiscounts,
  };
}