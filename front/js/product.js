// Récupération de l'identifiant de produit à partir de l'URL
const productId = new URLSearchParams(window.location.search).get('productId');

// Récupération des données de produit à partir de l'API en utilisant l'identifiant de produit passé dans l'URL
fetch(`http://localhost:3000/api/products/${productId}`)
  .then(response => {
    return response.json()
  })
  .then(product => {
    // Récupération des éléments HTML pour la mise à jour avec les données de produit
    const { title, imageContainer, description, colorList, price, addToCartBtn, quantityInput } = {
      title: document.getElementById('title'),
      imageContainer: document.querySelector('.item__img'),
      description: document.getElementById('description'),
      colorList: document.getElementById('colors'),
      price: document.getElementById('price'),
      addToCartBtn: document.getElementById('addToCart'),
      quantityInput: document.getElementById('quantity'),
    };
    // Mise à jour du titre avec le nom de produit
    title.textContent = product.name;
    // Création d'un élément image avec l'URL de l'image de produit et la description alternative
    const imageElement = document.createElement('img');
    imageElement.src = product.imageUrl;
    imageElement.alt = product.altTxt;
    // Ajout de l'image à la page
    imageContainer.appendChild(imageElement);
    // Mise à jour de la description de produit
    description.textContent = product.description;
    // Mise à jour du prix
    price.textContent = product.price;
    // Boucle pour ajouter chaque option de couleur à la liste déroulante
    for (const color of product.colors) {
      const optionElement = document.createElement('option');
      optionElement.value = color;
      optionElement.textContent = color;
      colorList.appendChild(optionElement);
    }
    // Récupération du panier existant depuis le stockage local ou création d'un nouveau panier
    let cart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    // Ajout d'un écouteur d'événement pour l'ajout de produit au panier
    addToCartBtn.addEventListener('click', () => {
      // Vérification si une couleur est sélectionnée
      if (!colorList.value) {
        alert("Veuillez sélectionner une couleur avant d'ajouter un produit au panier");
        return;
      }
      // Vérification si la quantité saisie est supérieure à 0
      if (quantityInput.value <= 0) {
        alert("Veuillez saisir une quantité minimum de 1 produit");
        return;
      }
      // Récupération de la couleur sélectionnée, de la quantité saisie et du prix
      const selectedColor = colorList.value;
      const selectedQuantity = Number(quantityInput.value);
      // Vérification si un produit similaire existe déjà dans le panier
      const existingProduct = cart.find(p => p.id === productId && p.color === selectedColor);
      // Si oui, on incrémente la quantité de ce produit existant
      if (existingProduct) {
        existingProduct.quantity += selectedQuantity;
      }
      // Sinon, on ajoute un nouvel élément au panier
      else {
        cart.push({ id: productId, color: selectedColor, quantity: selectedQuantity });
      }
      // Stockage du panier mise à jour dans le stockage local
      localStorage.setItem("cart", JSON.stringify(cart));
      // Affichage du message de confirmation
      const confirmationMessage = `Le produit a été ajouté au panier`;
      window.alert(confirmationMessage);
    });

    // Fonction pour afficher le contenu du panier dans la console
    function displayCart() {
      const cart = JSON.parse(localStorage.getItem("cart"));
      console.log(cart);
    }
    
    // Ajout d'un écouteur d'événement pour l'affichage du panier lors de l'ajout d'un produit
    document.getElementById("addToCart").addEventListener("click", displayCart); 
  });