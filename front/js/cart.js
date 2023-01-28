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
        fetch(`http://localhost:3000/api/products/${item.id}`)
            .then(response => response.json())
            .then(product => {
                const articleElement = createCartItemElement(product, item);
                getCartItemsElement().appendChild(articleElement);
                totalItems += item.quantity;
                totalPrice += product.price * item.quantity;
                updateCartTotals();

                // Ajout de l'écouteur d'événement "click" sur l'élément de suppression
                articleElement.querySelector('.deleteItem').addEventListener('click', removeCartItem);
            });
    }
}

// Fonction pour créer un élément HTML pour un produit dans le panier
function createCartItemElement(product, item) {
    const articleElement = document.createElement('article');
    articleElement.classList.add('cart__item');
    articleElement.setAttribute('data-id', product.id);
    articleElement.setAttribute('data-color', item.color);
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
    return articleElement;
}

// Fonction pour mettre à jour les totaux d'articles et de prix dans le DOM
function updateCartTotals() {
    const totalItemsElement = document.getElementById('totalQuantity');
    totalItemsElement.textContent = totalItems;

    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.textContent = totalPrice;
}

displayCartItems(getCartFromLocalStorage());

// Fonction pour supprimer un élément du panier
function removeCartItem(event) {
    const button = event.currentTarget;
    const article = button.closest('article');
    const id = article.getAttribute('data-id');
    const color = article.getAttribute('data-color');
    // Récupération du produit  à partir de l'API 
    fetch(`http://localhost:3000/api/products/${id}`)
        .then(response => response.json())
        .then(product => {
            // Récupération du panier à partir du stockage local
            let cart = getCartFromLocalStorage();
            // Filtrage des éléments du panier pour ne pas inclure l'élément à supprimer
            let newCart = cart.filter(item => !(item.id === id && item.color === color));
    
            // Mise à jour des totaux d'articles et de prix
            totalItems -= article.querySelector('.itemQuantity').value;
            totalPrice -= article.querySelector('.cart__item__content__description > p:nth-child(3)').textContent.slice(0,-1) * article.querySelector('.itemQuantity').value;
            updateCartTotals();
    
            // Suppression de l'élément HTML du panier
            article.remove();

            // Mise à jour du panier dans le stockage local
            localStorage.setItem('cart', JSON.stringify(newCart));
        });
}