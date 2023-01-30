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

let totalItems = 0;
let totalPrice = 0;

// Boucle pour créer des éléments HTML pour chaque produit dans le panier
function displayCartItems(cart) {
    console.log('Boucle pour créer des éléments HTML pour chaque produit dans le panier...');
    for (const item of cart) {
        fetch(`http://localhost:3000/api/products/${item.id}`)
            .then(response => {
                console.log(`Requête envoyée pour récupérer les détails du produit id: ${item.id}`);
                if (!response.ok) {
                    throw new Error(`Erreur de réponse : ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(product => {
                const articleElement = createCartItemElement(product, item);
                console.log(`Elément créé pour le produit id: ${item.id}`);
                getCartItemsElement().appendChild(articleElement);
                console.log(`Elément ajouté pour le produit id: ${item.id}`);
                totalItems += item.quantity;
                totalPrice += product.price * item.quantity;
                updateCartTotals();

                // Ajout de l'écouteur d'événement "click" sur l'élément de suppression
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
    const articleElement = document.createElement('article');
    articleElement.classList.add('cart__item');
    articleElement.setAttribute('data-id', item.id);
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
    console.log(`Elément HTML créé pour le produit id: ${item.id}`);
    return articleElement;
}

// Fonction pour mettre à jour les totaux d'articles et de prix dans le DOM
function updateCartTotals() {
    const totalItemsElement = document.getElementById('totalQuantity');
    totalItemsElement.textContent = totalItems;
    console.log(`Nombre total d'articles mis à jour: ${totalItems}`);

    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.textContent = totalPrice;
    console.log(`Prix total mis à jour: ${totalPrice}`);
}

displayCartItems(getCartFromLocalStorage());

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