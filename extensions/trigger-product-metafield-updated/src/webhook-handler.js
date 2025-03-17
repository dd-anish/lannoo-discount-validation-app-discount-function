async function handleProductUpdate(api, shop, body) {
    try {
      const productData = JSON.parse(body);
      const productId = productData.id;
      const gid = `gid://shopify/Product/${productId}`;
      
      const query = `
        query getProductMetafield($productId: ID!) {
          product(id: $productId) {
            id
            title
            metafield(namespace: "custom", key: "has_sample_copy") {
              value
              updatedAt
            }
          }
        }
      `;
      
      const response = await api.graphql({
        data: {
          query,
          variables: { productId: gid }
        }
      });
      
      const product = response.body.data.product;
      const metafield = product?.metafield;
      
      if (metafield) {
        const metafieldUpdatedAt = new Date(metafield.updatedAt);
        const now = new Date();
        const diffMiliSeconds = now - metafieldUpdatedAt;
        const diffMin = Math.round(diffMiliSeconds / 60000);        
        
        if (diffMiliSeconds <= 1000) {
          const metafieldValue = metafield.value.toLowerCase() === 'true';
          
          const mutation = `
            mutation {
              flowTriggerReceive(
                handle: "trigger-product-updated",
                payload: {
                  "product_id": "${gid}",
                  "metafield_value": ${metafieldValue}
                }
              ) {
                userErrors {
                  field
                  message
                }
              }
            }
          `;
          
          const triggerResponse = await api.graphql({
            data: { query: mutation }
          });
          console.log("Updated a Metafield");
          console.log("Flow trigger result:", JSON.stringify(triggerResponse.body.data));
        }
      }
    } catch (error) {
      console.error("Error handling product update:", error);
    }
  }