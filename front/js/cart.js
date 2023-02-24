// Récupération des données de produit du panier à partir du stockage local
function getCartFromLocalStorage() {
    console.log('Récupération des données de produit du panier à partir du stockage local...');
    return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
}

// Récupération de l'élément où les produits du panier seront affichés
function getCartItemsElement() {
    console.log('Récupération de l\'élément où les produits du panier seront affichés...');
    return document.getElementById('cart__items');
}

// Initialisation des variables pour le nombre total d'articles et le prix total
let totalItems = 0;
let totalPrice = 0;

// Boucle pour créer des éléments HTML pour chaque produit dans le panier
function displayCartItems(cart) {
    console.log('Boucle pour créer des éléments HTML pour chaque produit dans le panier...');
    for (const item of cart) {
        // Requête pour récupérer les détails du produit
        fetch(`http://localhost:3000/api/products/${item.id}`)
            .then(response => {
                console.log(`Requête envoyée pour récupérer les détails du produit id: ${item.id}`);
                // Vérification de la réponse de la requête
                if (!response.ok) {
                    throw new Error(`Erreur de réponse : ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(product => {
                // Création de l'élément HTML pour le produit dans le panier
                const articleElement = createCartItemElement(product, item);
                console.log(`Elément créé pour le produit id: ${item.id}`);
                // Ajout de l'élément à la liste des produits dans le panier
                getCartItemsElement().appendChild(articleElement);
                console.log(`Elément ajouté pour le produit id: ${item.id}`);
                // Mise à jour des totaux d'articles et de prix
                totalItems += item.quantity;
                totalPrice += product.price * item.quantity;
                updateCartTotals();
                // Ajout de l'écouteur d'événement "click" sur le bouton de suppression
                articleElement.querySelector('.deleteItem').addEventListener('click', removeCartItem);
                console.log(`Ecouteur d'événement "click" ajouté pour le produit id: ${item.id}`);
            })
            .catch(error => {
                console.error(`Erreur lors de la récupération des détails du produit id: ${item.id}`);
                console.error(error);
            });
    }
}

// Fonction pour créer un élément HTML pour un produit dans le panier
function createCartItemElement(product, item) {
    // Créer un élément HTML <article> pour l'article du panier
    const articleElement = document.createElement('article');
    // Ajouter une classe "cart__item" à l'élément <article>
    articleElement.classList.add('cart__item');
    // Définir les attributs "data-id" et "data-color" de l'élément <article> avec l'ID et la couleur de l'article
    articleElement.setAttribute('data-id', item.id);
    articleElement.setAttribute('data-color', item.color);
    // Définir le contenu HTML de l'élément <article> avec les informations de l'article et les éléments de contrôle de la quantité et de suppression
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
    // Afficher un message de console pour indiquer que l'élément HTML a été créé pour l'article du panier
    console.log(`Elément HTML créé pour le produit id: ${item.id}`);
  
    // Ajouter un gestionnaire d'événement "input" à l'élément <input> pour mettre à jour la quantité de l'article dans le panier lorsqu'elle est modifiée
    articleElement.querySelector('.itemQuantity').addEventListener('change', updateQuantity);
  
    // Retourner l'élément <article> créé pour l'article du panier
    return articleElement;
}

// Fonction pour mettre à jour les totaux d'articles et de prix dans le DOM
function updateCartTotals() {
    // Récupérer l'élément HTML qui affiche le nombre total d'articles
    const totalItemsElement = document.getElementById('totalQuantity');
    // Mettre à jour le nombre total d'articles affiché
    totalItemsElement.textContent = totalItems;
    // Afficher un message de console indiquant que le nombre total d'articles a été mis à jour
    console.log(`Nombre total d'articles mis à jour: ${totalItems}`);

    // Récupérer l'élément HTML qui affiche le prix total
    const totalPriceElement = document.getElementById('totalPrice');
    // Mettre à jour le prix total affiché
    totalPriceElement.textContent = totalPrice;
    // Afficher un message de console indiquant que le prix total a été mis à jour
    console.log(`Prix total mis à jour: ${totalPrice}`);
}

// Appeler la fonction displayCartItems pour afficher les produits dans le panier en utilisant les données du panier stockées dans le stockage local
displayCartItems(getCartFromLocalStorage());

// Fonction pour mettre à jour la quantité d'un produit dans le panier en réponse à un événement de saisie utilisateur
function updateQuantity(event) {
    // Récupérer l'élément HTML sur lequel l'utilisateur a saisi une nouvelle quantité
    const target = event.target;
    // Récupérer l'identifiant du produit correspondant à l'élément HTML sur lequel l'utilisateur a saisi une nouvelle quantité
    const id = target.closest('article').getAttribute('data-id');
    // Récupérer la couleur du produit correspondant à l'élément HTML sur lequel l'utilisateur a saisi une nouvelle quantité
    const color = target.closest('article').getAttribute('data-color');
    // Récupérer la nouvelle quantité saisie par l'utilisateur
    let newQuantity = target.value;

    // Récupérer le panier stocké dans le stockage local
    let cart = getCartFromLocalStorage();
    // Trouver l'index de l'objet correspondant au produit et à la couleur dans le panier
    const itemIndex = cart.findIndex(item => item.id === id && item.color === color);
    // Convertir la nouvelle quantité saisie par l'utilisateur en nombre entier, ou en 0 si la conversion échoue
    newQuantity = parseInt(newQuantity) || 0;
    // Mettre à jour la quantité du produit dans le panier avec la nouvelle quantité saisie par l'utilisateur
    cart[itemIndex].quantity = newQuantity;
    // Mettre à jour le panier stocké dans le stockage local avec la nouvelle quantité du produit
    localStorage.setItem("cart", JSON.stringify(cart));

    // Réinitialiser les variables totalItems et totalPrice à 0
    totalItems = 0;
    totalPrice = 0;

    // Vider l'élément HTML qui affiche les produits dans le panier
    getCartItemsElement().innerHTML = '';
    // Afficher les produits mis à jour dans le panier en utilisant les données du panier stockées dans le stockage local
    displayCartItems(cart);
}

// Fonction pour supprimer un élément du panier
function removeCartItem(event) {
    // Récupération du bouton cliqué
    const button = event.currentTarget;
    // Récupération de l'élément HTML représentant le produit dans le panier
    const article = button.closest('article');
    // Récupération de l'ID et de la couleur du produit à partir des attributs data-id et data-color de l'élément
    const id = article.getAttribute('data-id');
    const color = article.getAttribute('data-color');

    console.log("ID du produit sélectionné pour suppression :", id);
    console.log("Couleur du produit sélectionné pour suppression :", color);

    // Récupération du produit à partir de l'API 
    fetch(`http://localhost:3000/api/products/${id}`)
        .then(response => {
            console.log("Réponse de l'API pour le produit sélectionné :", response);
            return response.json();
        })
        .then(product => {
            console.log("Données du produit sélectionné :", product);

            // Récupération du panier à partir du stockage local
            let cart = getCartFromLocalStorage();
            console.log("Contenu actuel du panier :", cart);

            // Filtrage des éléments du panier pour ne pas inclure l'élément à supprimer
            let newCart = cart.filter(item => !(item.id === id && item.color === color));
            console.log("Contenu mis à jour du panier après suppression :", newCart);

            // Mise à jour des totaux d'articles et de prix
            totalItems -= article.querySelector('.itemQuantity').value;
            totalPrice -= article.querySelector('.cart__item__content__description > p:nth-child(3)').textContent.slice(0,-1) * article.querySelector('.itemQuantity').value;
            console.log("Nouveaux totaux d'articles :", totalItems);
            console.log("Nouveau total de prix :", totalPrice);
            updateCartTotals();

            // Suppression de l'élément HTML du panier
            article.remove();
            console.log("Élément HTML du panier supprimé");

            // Mise à jour du panier dans le stockage local
            localStorage.setItem('cart', JSON.stringify(newCart));
            console.log("Contenu mis à jour du panier enregistré dans le stockage local");
        })
        .catch(error => {
            console.error("Une erreur s'est produite lors de la récupération des données du produit :", error);
        });
}

const form = document.querySelector('.cart__order__form');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
    const firstName = document.querySelector('#firstName').value.trim();
    const lastName = document.querySelector('#lastName').value.trim();
    const address = document.querySelector('#address').value.trim();
    const city = document.querySelector('#city').value.trim();
    const email = document.querySelector('#email').value.trim();
  
    const nameRegex = /^[a-zA-Zéèêëôœûüîïàáâæç\- ]{2,30}$/;
    const addressRegex = /^[a-zA-Z0-9éèêëôœûüîïàáâæç\- ]{5,100}$/;
    const cityRegex = /^[a-zA-Zéèêëôœûüîïàáâæç\- ]{2,40}$/;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  
    let isValid = true;
  
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

    console.log('isValid', isValid);
  
    if (!isValid) {
      return;
    }
  
    const contact = {
      firstName,
      lastName,
      address,
      city,
      email
    };
  
    const cartItems = document.querySelectorAll('.cart__item');
  
    const products = Array.from(cartItems).map(function(item) {
      const id = item.getAttribute('data-id');
  
      return id;
    });

    console.log('contact', contact);
    console.log('products', products);
  
    const order = {
      contact,
      products
    };
  
    fetch('http://localhost:3000/api/products/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    })
    .then(function(response) {
        console.log(response);
        return response.json();
    })
    .then(function(data) {
        console.log(data);
        const orderId = data.orderId;
        window.location.href = `confirmation.html?id=${orderId}`;
    })
    .catch(function(error) {
        console.error(error);
        alert('Une erreur est survenue lors de l\'envoi de la commande.');
    });
});