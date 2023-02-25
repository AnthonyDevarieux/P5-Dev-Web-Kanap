// Récupération des données de produit du panier à partir du stockage local
function getCartFromLocalStorage() {
  return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
}

// Récupération de l'élément où les produits du panier seront affichés
function getCartItemsElement() {
  return document.getElementById('cart__items');
}

// Initialisation des variables pour le nombre total d'articles et le prix total
let totalItems = 0;
let totalPrice = 0;

// Boucle pour créer des éléments HTML pour chaque produit dans le panier
function displayCartItems(cart) {
  // Pour chaque élément du panier, effectuer une requête API pour obtenir le produit correspondant
  for (const item of cart) {
    fetch(`http://localhost:3000/api/products/${item.id}`)
      .then(response => {
        // Vérifier si la réponse est valide, sinon jeter une erreur
        if (!response.ok) {
            throw new Error(`Erreur de réponse : ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(product => {
        // Créer un nouvel élément HTML pour le produit et l'ajouter à la page
        const articleElement = createCartItemElement(product, item);
        getCartItemsElement().appendChild(articleElement);
        // Mettre à jour le nombre total d'articles et le prix total
        totalItems += item.quantity;
        totalPrice += product.price * item.quantity;
        updateCartTotals();
      })
      .catch(error => {
          console.error(`Erreur lors de la récupération des détails du produit id: ${item.id}`);
          console.error(error);
      });
  }
}

// Fonction pour créer un élément HTML pour un produit dans le panier
function createCartItemElement(product, item) {
  // Création d'un élément <article> pour contenir les informations d'un produit dans le panier
  const articleElement = document.createElement('article');
  // Ajout de classes CSS à l'élément <article>
  articleElement.classList.add('cart__item');
  // Ajout d'attributs de données personnalisés pour stocker l'ID du produit et sa couleur sélectionnée
  articleElement.setAttribute('data-id', item.id);
  articleElement.setAttribute('data-color', item.color);  
  // Ajout des éléments HTML pour afficher l'image, la description et les options de l'article
  articleElement.innerHTML = `
    <div class="cart__item__img">
      <img src="${product.imageUrl}" alt="${product.altTxt}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__description">
        <h2>${product.name}</h2>
        <p>${item.color}</p>
        <p>${product.price} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
  `;
  // Ajout de l'écouteur d'événement "click" sur le bouton de suppression
  articleElement.querySelector('.deleteItem').addEventListener('click', removeCartItem);
  // Ajouter un gestionnaire d'événement "input" à l'élément <input> pour mettre à jour la quantité de l'article dans le panier lorsqu'elle est modifiée
  articleElement.querySelector('.itemQuantity').addEventListener('change', updateQuantity);
  return articleElement;
}

// Fonction pour mettre à jour les totaux d'articles et de prix dans le DOM
function updateCartTotals() {
  // Récupère l'élément HTML correspondant au nombre total d'articles
  const totalItemsElement = document.getElementById('totalQuantity');
  // Met à jour le texte de l'élément avec la valeur de la variable totalItems
  totalItemsElement.textContent = totalItems;
  // Récupère l'élément HTML correspondant au prix total
  const totalPriceElement = document.getElementById('totalPrice');
  // Met à jour le texte de l'élément avec la valeur de la variable totalPrice
  totalPriceElement.textContent = totalPrice;
}

// Appeler la fonction displayCartItems pour afficher les produits dans le panier en utilisant les données du panier stockées dans le stockage local
displayCartItems(getCartFromLocalStorage());

// Fonction pour mettre à jour la quantité d'un produit dans le panier en réponse à un événement de saisie utilisateur
function updateQuantity(event) {
  const target = event.target;
  // Récupération de l'identifiant et de la couleur du produit en fonction de l'article parent de l'élément cible de l'événement
  const id = target.closest('article').getAttribute('data-id');
  const color = target.closest('article').getAttribute('data-color');
  // Récupération de la nouvelle quantité saisie par l'utilisateur et du contenu du panier depuis le stockage local
  let newQuantity = target.value;
  let cart = getCartFromLocalStorage();
  // Recherche de l'index de l'élément correspondant dans le tableau du panier
  const itemIndex = cart.findIndex(item => item.id === id && item.color === color);
  // Conversion de la nouvelle quantité en nombre entier et mise à jour de la quantité de l'élément correspondant dans le tableau du panier
  newQuantity = parseInt(newQuantity) || 0;
  cart[itemIndex].quantity = newQuantity;
  // Mise à jour des données du panier dans le stockage local et réinitialisation des variables totalItems et totalPrice
  localStorage.setItem("cart", JSON.stringify(cart));
  totalItems = 0;
  totalPrice = 0;
  // Suppression des éléments HTML affichant les produits dans le panier
  getCartItemsElement().innerHTML = '';
  // Appel de la fonction displayCartItems pour réafficher les produits dans le panier avec les données mises à jour
  displayCartItems(cart);
}

// Fonction pour supprimer un élément du panier
function removeCartItem(event) {
  // Récupération du bouton qui a déclenché l'événement et de son élément parent <article>
  const button = event.currentTarget;
  const article = button.closest('article');
  // Récupération de l'identifiant (id) et de la couleur de l'article à supprimer
  const id = article.getAttribute('data-id');
  const color = article.getAttribute('data-color');
  // Récupération du produit correspondant à l'article supprimé à partir de l'API
  fetch(`http://localhost:3000/api/products/${id}`)
    .then(response => {
      return response.json();
    })
    .then(product => {
      // Suppression de l'article du panier en créant un nouveau panier qui exclut l'article supprimé
      let cart = getCartFromLocalStorage();
      let newCart = cart.filter(item => !(item.id === id && item.color === color));
      // Mise à jour du nombre total d'articles et du prix total
      totalItems -= article.querySelector('.itemQuantity').value;
      totalPrice -= article.querySelector('.cart__item__content__description > p:nth-child(3)').textContent.slice(0,-1) * article.querySelector('.itemQuantity').value;
      // Mise à jour des totaux dans le DOM
      updateCartTotals();
      // Suppression de l'article du DOM
      article.remove();
      // Mise à jour du panier dans le stockage local
      localStorage.setItem('cart', JSON.stringify(newCart));
    })
    .catch(error => {
      console.error("Une erreur s'est produite lors de la récupération des données du produit :", error);
    });
}

// Récupération de l'élément de formulaire HTML
const form = document.querySelector('.cart__order__form');

// Ajout d'un gestionnaire d'événement de soumission du formulaire
form.addEventListener('submit', function(event) {
  event.preventDefault();
  // Récupération des données de formulaire saisies par l'utilisateur
  const firstName = document.querySelector('#firstName').value.trim();
  const lastName = document.querySelector('#lastName').value.trim();
  const address = document.querySelector('#address').value.trim();
  const city = document.querySelector('#city').value.trim();
  const email = document.querySelector('#email').value.trim();
  // Définition des expressions régulières pour la validation des données de formulaire
  const nameRegex = /^[a-zA-Zéèêëôœûüîïàáâæç\- ]{2,30}$/;
  const addressRegex = /^[a-zA-Z0-9éèêëôœûüîïàáâæç\- ]{5,100}$/;
  const cityRegex = /^[a-zA-Zéèêëôœûüîïàáâæç\- ]{2,40}$/;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  let isValid = true;
  // Validation des données saisies par l'utilisateur
  if (!nameRegex.test(firstName)) {
    document.querySelector('#firstNameErrorMsg').textContent = 'Veuillez entrer un prénom valide';
    isValid = false;
  } else {
    document.querySelector('#firstNameErrorMsg').textContent = '';
  }

  if (!nameRegex.test(lastName)) {
    document.querySelector('#lastNameErrorMsg').textContent = 'Veuillez entrer un nom valide';
    isValid = false;
  } else {
    document.querySelector('#lastNameErrorMsg').textContent = '';
  }

  if (!addressRegex.test(address)) {
    document.querySelector('#addressErrorMsg').textContent = 'Veuillez entrer une adresse valide';
    isValid = false;
  } else {
    document.querySelector('#addressErrorMsg').textContent = '';
  }

  if (!cityRegex.test(city)) {
    document.querySelector('#cityErrorMsg').textContent = 'Veuillez entrer une ville valide';
    isValid = false;
  } else {
    document.querySelector('#cityErrorMsg').textContent = '';
  }

  if (!emailRegex.test(email)) {
    document.querySelector('#emailErrorMsg').textContent = 'Veuillez entrer une adresse e-mail valide';
    isValid = false;
  } else {
    document.querySelector('#emailErrorMsg').textContent = '';
  }
  if (!isValid) {
    return;
  }
  // Création d'un objet contact à partir des données de formulaire saisies par l'utilisateur
  const contact = {
    firstName,
    lastName,
    address,
    city,
    email
  };
  // Création d'un tableau products à partir des ID des produits dans le panier
  const cartItems = document.querySelectorAll('.cart__item');
  const products = Array.from(cartItems).map(function(item) {
    const id = item.getAttribute('data-id');
    return id;
  });
  // Création d'un objet order contenant les données de contact de l'utilisateur et les ID des produits dans le panier
  const order = {
    contact,
    products
  };
  // Envoi de la requête POST pour passer la commande
  fetch('http://localhost:3000/api/products/order', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(order)
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const orderId = data.orderId;
    window.location.href = `confirmation.html?id=${orderId}`;
  })
  .catch(function(error) {
    console.error(error);
    alert('Une erreur est survenue lors de l\'envoi de la commande.');
  });
});