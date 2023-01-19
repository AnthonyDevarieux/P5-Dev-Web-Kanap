// Récupération des données de produit du panier à partir du stockage local
function getCartFromLocalStorage() {
    return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
}

// Récupération de l'élément où les produits du panier seront affichés
function getCartItemsElement() {
    return document.getElementById('cart__items');
}

let totalItems = 0;
let totalPrice = 0;

// Boucle pour créer des éléments HTML pour chaque produit dans le panier
function displayCartItems(cart) {
    for (const item of cart) {
        // Récupération des données de produit à partir de l'API en utilisant l'identifiant de produit
        fetch(`http://localhost:3000/api/products/${item.id}`)
            .then(response => response.json())
            .then(product => {
                //Création des éléments HTML pour chaque produit
                const articleElement = createCartItemElement(product, item);
                // Ajout de l'élément à la page
                getCartItemsElement().appendChild(articleElement);
                // Mise à jour du nombre total d'articles et du prix total
                totalItems += item.quantity;
                totalPrice += product.price * item.quantity;
                // Mise à jour des totaux dans le DOM
                updateCartTotals();
            });
    }
}

// Fonction pour créer un élément HTML pour un produit dans le panier
function createCartItemElement(product, item) {
    // création d'un élément article
    const articleElement = document.createElement('article');
    // ajout de la class 'cart__item'
    articleElement.classList.add('cart__item');
    // ajout de l'attribut 'data-id' avec la valeur de l'id de produit
    articleElement.setAttribute('data-id', product.id);
    // ajout de l'attribut 'data-color' avec la valeur de la couleur de l'article
    articleElement.setAttribute('data-color', item.color);
    // on ajoute le contenu HTML
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
    // on retourne l'élément
    return articleElement;
}

// Fonction pour mettre à jour les totaux d'articles et de prix dans le DOM
function updateCartTotals() {
    // récupère l'élément avec l'id 'totalQuantity'
    const totalItemsElement = document.getElementById('totalQuantity');
    // met à jour le contenu de l'élément avec la valeur de totalItems
    totalItemsElement.textContent = totalItems;

    // récupère l'élément avec l'id 'totalPrice'
    const totalPriceElement = document.getElementById('totalPrice');
    // met à jour le contenu de l'élément avec la valeur de totalPrice
    totalPriceElement.textContent = totalPrice;
}

displayCartItems(getCartFromLocalStorage());