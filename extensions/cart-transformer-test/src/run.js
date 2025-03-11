// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log("✅ Cart Transformer Function is Running Update 2!");
  
  const { cart } = input;
  const operations = [];
  
  // Process each line in the cart
  for (const line of cart.lines) {
    const { id, quantity, merchandise } = line;

    // Validate merchandise ID
    if (!merchandise || !merchandise.id) {
      console.error("❌ Missing merchandise ID for line", line);
      continue;
    }
    
    // Only process lines with quantity > 1
    if (quantity <= 1) {
      continue;
    }
    
    // First, update the existing line to have quantity 1
    operations.push({
      update: {
        cartLineId: id,
        quantity: 1,
        attributes: [
          { key: "sample_unit", value: "true" }
        ]
      }
    });
    
    // Then, add a new line for the remaining quantity
    operations.push({
      add: {
        merchandiseId: merchandise.id,
        quantity: quantity - 1,
        attributes: [
          { key: "regular_units", value: "true" }
        ]
      }
    });
  }
  
  // If no changes needed, return empty operations array
  if (operations.length === 0) {
    return { operations: [] };
  }
  
  console.log("✅ Operations to apply:", JSON.stringify(operations, null, 2));

  return { operations };
}
