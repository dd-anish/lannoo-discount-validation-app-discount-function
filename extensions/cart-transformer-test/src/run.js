// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

export function run(input) {
  console.log("✅ Cart Transformer Function is Running Update 4!");

  const { cart } = input;
  const operations = [];

  for (const line of cart.lines) {
    const { id, quantity, merchandise } = line;

    if (!merchandise || !merchandise.id) {
      console.error("❌ Missing merchandise ID for line", line);
      continue;
    }

    if (quantity <= 1) {
      continue;
    }

    // Step 1: Remove the existing cart line entry.
    operations.push({
      update: {
        cartLineId: id
      }
    });

    // Step 2: Merge the updated quantity.
    operations.push({
      merge: {
        parentVariantId: merchandise.id,
        cartLines: [
          {
            cartLineId: id, // Correct field
            quantity: quantity - 1 // Correct quantity adjustment
          }
        ]
      }
    });
  }

  if (operations.length === 0) {
    return { operations: [] };
  }

  console.log("✅ Operations to apply:", JSON.stringify(operations, null, 2));

  return { operations };
}