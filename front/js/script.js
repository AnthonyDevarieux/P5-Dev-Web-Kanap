function fetchProductList() {
  // Envoyer une requête HTTP à l'API pour récupérer la liste des produits
  return fetch('http://localhost:3000/api/products')
    .then((response) => {
      // Récupérer la réponse sous forme de JSON
      return response.json();
    });
}

function createProductElement(product) {
  // Créer un élément HTML pour le produit
  const productElement = document.createElement('a');
  productElement.innerHTML = `
    <a href="product.html?productId=${product._id}">
      <article>
        <img src="${product.imageUrl}" alt="${product.altTxt}">
        <h3 class="productName">${product.name}</h3>
        <p class="productDescription">${product.description}</p>
      </article>
    </a>
  `;
  return productElement;
}

function getProducts() {
  // Récupérer la liste des produits
  fetchProductList()
    .then((products) => {
      // Parcourir la liste des produits
      for (const product of products) {
        // Créer un élément HTML pour chaque produit
        const productElement = createProductElement(product);
        // Ajouter l'élément au DOM
        document.getElementById('items').appendChild(productElement);
      }
    });
}

// Appeler la fonction pour récupérer et afficher les produits
getProducts();