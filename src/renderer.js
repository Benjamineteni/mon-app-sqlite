/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './renderer/css/bootstrap.min.css';
import './renderer/css/style.css';
import './renderer/css/bootstrap-icons.css';

import './renderer/js/bootstrap.min.js';

const productForm = document.querySelector('#productForm');
const productNameElement = document.querySelector('#productName');
const productPriceElement = document.querySelector('#productPrice');
const productQtyElement = document.querySelector('#productQty');
const btnSubmit = document.querySelector('#btnSubmit');

let productAction = 'create'; // 'create' or 'update'
let productId;


// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

productForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = productNameElement?.value ?? '';
  const price = productPriceElement?.value ?? '';
  const quantity = productQtyElement?.value ?? '';

  let product = {
    name,
    price,
    quantity
  };

  try {
    if (productAction === 'update') {
      console.log('Updating product with values:', { name, price, quantity });
      const updatedProduct = await window.apiProducts.updateProduct(productId, product);
      console.log('product updated successfully :', updatedProduct);
      btnSubmit.textContent = 'Save';
      productAction = 'create';
      productId = undefined;
    } else {
      console.log('Creating product with values:', { name, price, quantity });
      const newProduct = await window.apiProducts.createProduct(product);
      console.log('product created successfully :', newProduct);
    }
  } catch (err) {
    console.error('Error saving/updating product:', err);
  }
  productForm?.reset();
  loadProducts();
});

// Load products and display them
async function loadProducts() {
  try {
    const products = await window.apiProducts.listProducts();
    displayProducts(products);
  } catch (error) {
    console.error('Error occured when loading products:', error);
  }
}

// Create html elements to display products
function displayProducts(products) {
  const productListElement = document.getElementById('product-list');

  if (products.length === 0) {
    productListElement.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                    Aucun produit trouvé
                </td>
            </tr>
        `;
    return;
  }

  productListElement.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><strong>${escapeHtml(product?.name)}</strong></td>
            <td class="text-end">${formatPrice(product?.price)} </td>
            <td class="text-center">
                <span class="badge ${product?.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                    ${product?.quantity}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info btn-action" onclick="initiateUpdate(${product.id}, '${escapeHtml(product?.name)}', ${product?.price}, ${product?.quantity})">
                    Update <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="deleteProduct(${product.id})">
                    Delete <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.deleteProduct = async (id) => {
  if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) {
    return;
  }

  try {
    await window.apiProducts.deleteProduct(id);
    await loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

window.initiateUpdate = (id, name, price, quantity) => {
  productNameElement.value = name ?? '';
  productPriceElement.value = price ?? '';
  productQtyElement.value = quantity ?? '';
  btnSubmit.textContent = 'Update';
  productNameElement.focus();
  productAction = 'update';
  productId = id;
};

// Formater le prix
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

// Échapper les caractères HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}