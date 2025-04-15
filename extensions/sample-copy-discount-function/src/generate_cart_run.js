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

export function generateCartRun(input) {
    if (!input.cart.lines.length) {
        throw new Error('No cart lines found');
    }

    const maxCartLine = input.cart.lines.reduce((maxLine, line) => {
        if (line.cost.subtotalAmount > maxLine.cost.subtotalAmount) {
            console.log("Max Line:", line.cost.subtotalAmount.amount);

            return line;
        }
        return maxLine;
    }, input.cart.lines[0]);

    console.log("Max: ", JSON.stringify(maxCartLine, null, 2));

    return {
        operations: [
            {
                orderDiscountsAdd: {
                    candidates: [
                        {
                            message: '10% OFF ORDER',
                            targets: [
                                {
                                    orderSubtotal: {
                                        excludedCartLineIds: [],
                                    },
                                },
                            ],
                            value: {
                                percentage: {
                                    value: 10,
                                },
                            },
                        },
                    ],
                    selectionStrategy: OrderDiscountSelectionStrategy.First,
                },
            },
            {
                productDiscountsAdd: {
                    candidates: [
                        {
                            message: '20% OFF PRODUCT',
                            targets: [
                                {
                                    cartLine: {
                                        id: maxCartLine.id,
                                    },
                                },
                            ],
                            value: {
                                percentage: {
                                    value: 20,
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