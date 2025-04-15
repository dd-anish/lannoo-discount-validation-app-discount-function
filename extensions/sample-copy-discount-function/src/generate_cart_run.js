// @ts-check

import {
    OrderDiscountSelectionStrategy,
    ProductDiscountSelectionStrategy,
} from '../generated/api';

/**
 * @typedef {import("../generated/api").CartInput} CartInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * generateCartRun
 * @param {CartInput} input - The CartInput
 * @returns {CartLinesDiscountsGenerateRunResult} - The function result with discounts.
 */

const NO_OPERATIONS = {
    operations: []
};


export function generateCartRun(input) {

    if (!input.cart.lines.length) {
        throw new Error('No cart lines found');
    }

    const customer = input.cart.buyerIdentity?.customer;
    const sample_copy_opted = input.cart.attribute?.value === "true";

    // Skip if no customer or Cart Attribute False
    if (!customer || !sample_copy_opted) {
        console.log("Return if no customer or Cart Attribute False");

        return NO_OPERATIONS;
    }

    console.log("Cart Attribute: ", sample_copy_opted);


    const canCustomerOrderSample = customer.canOrderSamples?.value === "true";
    const customerSegment = customer.customerSegment?.value;
    const claimedFreeSampleCopyProductIds = customer.claimedFreeSampleCopyProductIds?.jsonValue || [];

    // console.log("New CustomerEmail:", customer.email);
    // console.log("New CustomerCan Order?:", canCustomerOrderSample);
    // console.log("New CustomerName:", customer.displayName);
    // console.log("New CustomerSegment:", customerSegment);

    // console.log("New CustomerProduct IDs", JSON.stringify(customer.claimedFreeSampleCopyProductIds, null, 2));

    const targets = input.cart.lines
        .filter((line) => {

            if (line.merchandise.__typename !== "ProductVariant") {
                return false;
            }

            const productSegment = line.merchandise?.product.productSegment?.value;

            const matchingSegment = customerSegment === productSegment;

            // The Product Metafield: has_sample_copy should be TRUE and mentioning === is must as without it the checking is not validated properly
            const productHasSampleCopy = line.merchandise.product.hasSampleCopy?.value === 'true';

            // The Customer should not have claimed the product before
            const alreadyClaimedSampleCopy = claimedFreeSampleCopyProductIds.includes(line.merchandise.product.id);

            // All Conditions for the Discounting a Product
            const isProductEligibleForDiscount = productHasSampleCopy && canCustomerOrderSample && matchingSegment && !alreadyClaimedSampleCopy;

            // console.log("New Discount on Product: ", isProductEligibleForDiscount);


            return isProductEligibleForDiscount;

        })
        .map((line) => {
            return {
                cartLine: {
                    id: line.id,
                    quantity: 1
                }
            };
        });

    // If no targets, return empty discount
    if (targets.length === 0) {

        console.log("NO Operations as targets is 0");

        return NO_OPERATIONS;
    }

    return {
        operations: [
            {
                productDiscountsAdd: {
                    candidates: [
                        {
                            message: `FREE SAMPLE COPY for ${input.cart.buyerIdentity?.customer?.displayName}`,
                            targets: targets,
                            value: {
                                percentage: {
                                    value: 100,
                                },
                            },
                        },
                    ],
                    selectionStrategy: ProductDiscountSelectionStrategy.First,
                },
            },
        ],
    };
}