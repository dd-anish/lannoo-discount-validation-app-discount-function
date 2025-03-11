// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */

const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
*/
export function run(input) {

  console.log("✅ Cart Transformer Function is Running Fast!");

  return NO_CHANGES;
};

/* export default function run(input) {
  const cart = input.cart;
  console.log("🛒 Cart Transformer Function Triggered!", cart);

  return {
    operations: [
      {
        type: "update",
        cartLines: cart.lines.map(line => ({
          id: line.id,
          quantity: 1, // Force quantity to 1 for testing
        }))
      }
    ]
  };
}
 */