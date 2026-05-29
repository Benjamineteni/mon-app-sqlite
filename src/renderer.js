const productForm = document.querySelector('#productForm');
const productName = document.querySelector('#productName');
const productPrice = document.querySelector('#productPrice');
const productQty = document.querySelector('#productQty');


productForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = productName?.value ?? '';
  const price = productPrice?.value ?? '';
  const quantity = productQty?.value ?? '';

  try {

   const newProduct = await window.apiProducts.createProduct(name, price, quantity);
   console.log('product created successfully :', newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
  }
});
