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
  console.log("✅ Cart Transformer Function is Running!");

  const { cart } = input;
  const operations = [];

  for (const line of cart.lines) {
    const { id, quantity, cost, merchandise } = line;

    if (!merchandise || !merchandise.id) {
      console.error("❌ Missing merchandise ID for line", line);
      continue;
    }

    // Check if the product has a 100% discount
    const unitPrice = parseFloat(cost.totalAmount.amount) / quantity;

    console.log("Unit Price is " , unitPrice);
    console.log("For Product: " , line.merchandise.product.title);
    console.log("Amount per line, ", line.cost.totalAmount.amount );
    
    
    
    const isDiscounted = unitPrice === 0.00;

    if (!isDiscounted || quantity <= 1) {
      continue;
    }

    // Step 1: Expand the cart line into two separate lines
    operations.push({
      expand: {
        cartLineId: id,
        expandedCartItems: [
          {
            merchandiseId: merchandise.id,
            quantity: 1, // Free unit
            price: {
              adjustment: {
                fixedPrice: {
                  amount: "0.00", // Free unit
                },
              },
            },
          },
          {
            merchandiseId: merchandise.id,
            quantity: quantity - 1, // Paid units
            price: {
              adjustment: {
                fixedPrice: {
                  amount: (cost.totalAmount.amount / quantity).toFixed(2), // Paid unit price
                },
              },
            },
          },
        ],
      },
    });
  }

  if (operations.length === 0) {
    console.log("✅ No operations to apply.");
    return { operations: [] };
  }

  console.log("✅ Operations to apply:", JSON.stringify(operations, null, 2));

  return { operations };
}