// Récupère l'identifiant de commande dans l'URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const orderId = urlParams.get('id');

// Affiche l'identifiant de commande à l'utilisateur
const orderIdElement = document.querySelector('#orderId');
orderIdElement.textContent = orderId;