'use strict';
import { Customers } from './classes/customers.js';
import { Factura } from './classes/factura.js';
import { TarjetasDeCredito } from './classes/tarjetasdecredito.js';
import { getGameData } from './services/rawgService.js';
const { jsPDF } = window.jspdf

const toastr = window.toastr;
let productos = [];
let carrito = [];

let currentPageUrl = window.location.href;

const cartContainer = document.querySelector('.cart-items');
const cartTitle = document.querySelector('.cart-title');
const checkoutContainer = document.getElementById('cart-checkout');
const GANANCIAS = 0.45;
const PAIS = 0.30;
let valorDolar = 470;
let divisaConvertida;
let total = 0;
let totalImpuestos = 0;
let formatedTotal = 0; 

if (localStorage.getItem('cart') !== null) {
  carrito = JSON.parse(localStorage.getItem('cart'));
} else {
  
}
window.addEventListener('DOMContentLoaded', function() {
  let header = document.getElementById("header");
  let carousel = document.getElementById("caroussel");
  let carouselBottom = carousel ? carousel.offsetTop + carousel.offsetHeight : 0;
  let scrollThreshold = carouselBottom - 100; // Ajusta este valor a tu preferencia

  function setHeaderBackground() {
    if (carousel && window.pageYOffset < scrollThreshold) {
      header.style.backgroundColor = "rgba(1, 1, 1, 0)"; /* Fondo transparente */
      header.style.position = "fixed"; /* Mantener la posición fija */
    } else {
      header.style.backgroundColor = "rgba(17, 17, 17, 1)"; /* Fondo sólido */
      header.style.position = "fixed"; /* Mantener la posición fija */
    }

    if (!carousel) {
      header.style.backgroundColor = "rgba(17, 17, 17, 1)"; /* Fondo sólido */
      header.style.position = "relative"; /* Cambiar la posición a relative */
    }
  }

  window.addEventListener('scroll', setHeaderBackground);

  // Ejecutar la función al cargar la página
  setHeaderBackground();
});

// Agregar esta línea de código para verificar si la página contiene un elemento con ID "carousel"
if (!document.getElementById("caroussel")) {
  let header = document.getElementById("header");
  header.style.backgroundColor = "rgba(17, 17, 17, 1)"; /* Fondo sólido */
  header.style.position = "relative"; /* Cambiar la posición a relative */
}

// Establecer la clase "active" en el enlace correspondiente
if (currentPageUrl === '/index.html') {
  document.getElementById('home-link').classList.add('active');
} else if (currentPageUrl === '/pages/productos.html') {
  document.getElementById('products-link').classList.add('active');
} else if (currentPageUrl === '/pages/contacto.html') {
  document.getElementById('contact-link').classList.add('active');
}

//Calculadora de precio de videojuegos de Steam Argentina.
const convertirPesoArgentino = (valorProd) => {
  divisaConvertida = valorProd * valorDolar;
  return divisaConvertida;
}
const generatePrice = () => {
  const min = 10;
  const max = 90;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toFixed(2);
}
const getData = async (cantProductos, currentPageUrl, params) => {
  loading.style.display = 'flex';
  loading.style.zIndex = '1000';

  productos = [];
  try {
    let juegos = await getGameData(params);
    for (let juego of juegos.results) {
      productos.push(juego);
    }
    productos.forEach((product) => {
      if (!product.precio) {
        product.precio = generatePrice();
      }
    });
    console.log(productos);

    if (currentPageUrl.endsWith('/productos.html')) {
      createProductsDom(cantProductos, currentPageUrl);
    } else if (currentPageUrl.endsWith('/index.html')) {
      createProductsDom(cantProductos, currentPageUrl);
      renderImages( cantProductos, ...productos,);
    } 

  } catch (error) {
    console.log('Error al obtener los datos:', error);
  }
  loading.style.display = 'none';
};
const calcularImpuestos = (base) => {
    let ganancias = base * GANANCIAS;
    let pais = (base * PAIS);
    totalImpuestos = base + ganancias + pais;
    return totalImpuestos;
}
// Crear elementos HTML para los productos
const createProductsDom = (cantProductos, currentPageUrl) => {
  let cardsContainer = ' ';
  let productContainer = ' ';
  productContainer = document.getElementById('products');
  cardsContainer = productContainer.querySelector(".cards");
  
  // Vaciar el contenedor de tarjetas
  cardsContainer.innerHTML = '';
  

  let newClassElements;
  let buttonClass;
  if (currentPageUrl.endsWith('/index.html')) {
    newClassElements = "game-preview";
    buttonClass = 'd-block';
  } else {
    newClassElements = "card";
    buttonClass = 'd-none';
  }
  for (let i = 0; i < cantProductos; i++) {
    const product = productos[i];
    // Obtener la información de las plataformas
    let platformsInfo = "";
    product.platforms.forEach(platform => {
      platformsInfo += `${platform.platform.name}, `;
    });
    platformsInfo = platformsInfo.slice(0, -2); // Eliminar la última coma y espacio

    const card = `
      <div class="${newClassElements}">
        <div class="image">
          <img src="${product.background_image}" alt="">
        </div>
        <div class="content">
          <div class=" card-title my-4">
            <p class="h4 game-title">${product.name}</p>
            <p class="h5 platform">Plataforma: ${platformsInfo}</p>
          </div>
          <div class="body">
            <p class="card-text precio">Precio: ${product.precio} DLS</p>
            <button class="btn button addBtn" type="button" data-id="${product.id}">Agregar al carrito</button>
          </div>
        </div>
      </div>
    `;
    cardsContainer.innerHTML += card;
  }
  cardsContainer.innerHTML += `
    <a class="${buttonClass}" href="pages/productos.html">
      <button class="btn button w-100 p-2">Ir a Productos</button>
    </a>
  `;

  // Agregar evento de clic en el botón "Agregar al carrito"
  const addBtn = document.querySelectorAll('.addBtn');
  for (let i = 0; i < addBtn.length; i++) {
    addBtn[i].addEventListener('click', (event) => {
      const productId = event.target.dataset.id; // obtener el ID del producto correspondiente al botón que se ha hecho clic
      let addedProduct = productos.find(product => product.id == productId);
      carrito.push(addedProduct);
      toastr.success(`El producto ${addedProduct.name} ha sido agregado al carrito`);
      renderCart();
    });
  }
}
const renderImages = ( cantProd, ...productos) => {
  console.log(productos);
  const imagesContainer = document.getElementById('images-container');
  let imageHtml = '';
  let visitedProducts = new Set(); // Utilizamos un conjunto para almacenar los productos visitados
  let count = 0;

  for (let product of productos) {
    if (!visitedProducts.has(product.id)) { // Verificamos si el producto ya ha sido visitado
      visitedProducts.add(product.id); // Agregamos el producto al conjunto de productos visitados

      if (product.short_screenshots.length > 0) { // Verificamos si el producto tiene imágenes
        const image = product.short_screenshots[1]; // Tomamos solo la primera imagen

        imageHtml += `
          <div class="card image">
            <img src="${image.image}" alt="">
          </div>
        `;
        count++;
      }
    }
    if (count === cantProd) {
      break;
    }
  }

  imagesContainer.innerHTML = imageHtml; // Actualizamos el contenedor de imágenes
}

const delBtns = () => {
    // Agregar eventos de clic en los botones "Eliminar del carrito"
    const delBtns = document.querySelectorAll('.delBtn');
    for (let i = 0; i < delBtns.length; i++) {
      delBtns[i].addEventListener('click', (event) => {
        const productId = event.target.dataset.id; // obtener el ID del producto correspondiente al botón que se ha hecho clic
        let index = carrito.findIndex(product => product.id == productId); // busca el índice del producto correspondiente en el carrito
        let deletedProd = carrito[index];
        if (index > -1) {
          carrito.splice(index, 1); // eliminar el producto del carrito
          event.target.closest('.cart-item').remove(); // eliminar el elemento del DOM
          toastr.success(`El producto ha sido eliminado del carrito`);
          total -= deletedProd.precio; // restar el precio del producto eliminado del total
          divisaConvertida = convertirPesoArgentino(total); // volver a convertir el total a pesos
          totalImpuestos = calcularImpuestos(divisaConvertida); // calcular los impuestos correspondientes al nuevo total
          totalImpuestos = totalImpuestos.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'}); // formatear el texto del total con los impuestos correspondientes
          formatedTotal = totalImpuestos;
          localStorage.setItem('cart', JSON.stringify(carrito));
          const totalElement = cartContainer.querySelector('.total');
          if (totalElement) {
            totalElement.textContent = `Total: ${formatedTotal} ARS`;
          }
          if (carrito.length == 0) {
            cartTitle.textContent = 'No hay productos en su carrito';
            const buyInfoElement = cartContainer.querySelector('.buyInfo');
            if (buyInfoElement) {
              buyInfoElement.remove();
            }
          }
        }
      });
    }
}

const showCheckout = () => {
  checkoutContainer.innerHTML = '';
  let checkoutInfo = '';
  total = 0;
  for (const product of carrito) {
    const cartItem = `
      <div class="cart-item d-flex flex-row my-3">
        <div class="image my-auto">
          <img src="${product.background_image}" alt="">
        </div>
        <div class="content">
          <p>${product.name}</p>
          <p>Precio: ${product.precio}DLS</p>
          <button class="btn button delBtn" type="button" data-id="${product.id}">Eliminar del carrito</button>
        </div>
      </div>
    `;
    checkoutContainer.innerHTML += cartItem;
    const precio = parseFloat(product.precio); // Convertir el precio a número
    if (!isNaN(precio)) {
      total += precio;
    }
  }

  if (carrito.length > 0) {
    const divisaConvertida = convertirPesoArgentino(total);
    const totalImpuestos = calcularImpuestos(divisaConvertida);
    const formatedTotal = totalImpuestos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    checkoutInfo = `
      <div class="buyInfo d-flex flex-column align-items-center p-2 rounded">
        <p class="text-muted">El valor se convierte a pesos y se le agregan los impuestos correspondientes</p>
        <p class="text-center total">Total: ${formatedTotal} ARS</p>
      </div>
    `;
    checkoutContainer.innerHTML += checkoutInfo;
    localStorage.setItem('cart', JSON.stringify(carrito));
  } else {
    cartTitle.textContent = 'No hay productos en su carrito';
  }
  delBtns();
};
// Crear elementos HTML para el carrito
const renderCart = () => {
  cartContainer.innerHTML = '';
  let buyInfo = '';
  total = 0;
  for (const product of carrito) {
    const cartItem = `
      <div class="cart-item d-flex flex-row my-3">
        <div class="image">
          <img src="${product.background_image}" alt="">
        </div>
        <div class="content">
          <p>${product.name}</p>
          <p>Precio: ${product.precio}DLS</p>
          <button class="btn button delBtn" type="button" data-id="${product.id}">Eliminar del carrito</button>
        </div>
      </div>
    `;
    cartContainer.innerHTML += cartItem;
    const precio = parseFloat(product.precio); // Convertir el precio a número
    if (!isNaN(precio)) {
      total += precio;
    }
  }

  if (carrito.length > 0) {
    cartTitle.textContent = 'Su compra';
    const divisaConvertida = convertirPesoArgentino(total);
    const totalImpuestos = calcularImpuestos(divisaConvertida);
    const formatedTotal = totalImpuestos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    buyInfo = `
      <div class="buyInfo bg-dark d-flex flex-column align-items-center p-2 rounded">
        <p class="text-center total">Total: ${formatedTotal} ARS</p>
        <p class="text-muted">El valor se convierte a pesos y se le agregan los impuestos correspondientes</p>
        <a href="../pages/compra.html"><button type="button" class="btn button">Comprar Ahora</button></a>
      </div>
    `;
    cartContainer.innerHTML += buyInfo;
    localStorage.setItem('cart', JSON.stringify(carrito));
  } else {
    cartTitle.textContent = 'No hay productos en su carrito';
  }
  delBtns();
};

const setAlertVisibility = ( alertElements, isVisible ) => {
  if (Array.isArray(alertElements)) {
    alertElements.forEach(alertElement => {
      alertElement.style.display = isVisible ? 'block' : 'none';
    });
  } else {
    alertElements.style.display = isVisible ? 'block' : 'none';
  }
}
if (currentPageUrl.endsWith("/productos.html")) {
  
  const loading = document.getElementById('loading');
  const btnIcons = document.querySelectorAll('.btn-icon');
  const compraExitosa = localStorage.getItem('compraExitosa');
  const pagination = document.getElementById('pagination');
  const modal = new bootstrap.Modal(document.getElementById('modal'));
  const searchInput = document.getElementById('searchInput');

  let currentPage = 1; // Página actual
  let params = '';
  loading.style.display = 'flex';
  loading.style.flexDirection = 'column';
  loading.style.position = 'fixed';
  loading.style.top = '0';
  loading.style.left = '0';
  loading.style.width = '100%';
  loading.style.height = '100%';
  loading.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  loading.style.justifyContent = 'center';
  loading.style.alignItems = 'center';
  
  if (compraExitosa === 'true') {
    // Mostrar el modal
    modal.show();
  
    // Limpiar el indicador de compra en el almacenamiento local
    localStorage.removeItem('compraExitosa');
  }
  
  btnIcons.forEach(btnIcon => {
    const input = btnIcon.querySelector('input');
    const iconWrapper = btnIcon.querySelector('.icon-wrapper');
  
    btnIcon.addEventListener('click', function() {
      input.checked = !input.checked;
      iconWrapper.classList.toggle('active', input.checked);
    });
  });
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  document.getElementById('filterForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada
    const formData = new FormData(this);
  
  
    const selectedPlatforms = Array.from(formData.getAll('platforms'));
    // Concatenar los valores de las opciones seleccionadas separados por comas
    if (selectedPlatforms.length > 0) {
      params += 'platforms=' + selectedPlatforms.join(',');
    }
  
    // Llamar a la función getData con los query params como argumento
    getData(20, currentPageUrl, params);
  });
  
  pagination.addEventListener('click', (event) => {
    const selectedPage = event.target.value;
  
    if (selectedPage === 'next') {
      currentPage++;
    } else if (selectedPage === 'back') {
      if (currentPage > 1) {
        currentPage--;
      }
    } else if (selectedPage.length > 0) {
      currentPage = parseInt(selectedPage);
    }
    if (params !== '') {
      params += `&page=${currentPage}`;
    } else {
      params += `page=${currentPage}`;

    }
    getData(20, currentPageUrl, params);
    scrollToTop();
  });
  
  getData(20, currentPageUrl);

  
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const searchText = searchInput.value.toLowerCase();
      params += `&search=${searchText}`;
      getData(20, currentPageUrl, params);
    }
  });
  
  if (carrito !== null) {
    renderCart();
  }
} else if (currentPageUrl.endsWith('/compra.html')) {

  const billPreview = document.getElementById('bill-container');
  billPreview.style.display="none";

  let content;
  let factura;
  let cliente;
  let productos;

  const customerName = document.getElementById('name');
  const customerNameErrorMessage = customerName.parentNode.querySelector('.alert-danger');
  const customerNameSuccessMessage = customerName.parentNode.querySelector('.alert-success');
  
  const phoneNumber = document.getElementById('phoneNumber');
  const phoneNumberErrorMessage = phoneNumber.parentNode.querySelectorAll('.alert-danger');
  const phoneNumberSuccessMessage = phoneNumber.parentNode.querySelectorAll('.alert-success');

  const address = document.getElementById('address')
  const addressErrorMessage = address.parentNode.querySelector('.alert-danger');
  const addressSuccessMessage = address.parentNode.querySelector('.alert-success');

  const emailInput = document.getElementById('email');
  const emailErrorMessage = document.getElementById('emailErrorMessage');
  const emailSuccessMessage = document.getElementById('emailSuccessMessage');


  const cardNumberInput = document.getElementById('cardNumber');
  const cardNumberErrorMessages = cardNumberInput.parentNode.querySelectorAll('.alert-danger');
  const cardNumberSuccessMessages = cardNumberInput.parentNode.querySelectorAll('.alert-success');

  const securityCodeInput = document.getElementById('securityCode');
  const securityCodeErrorMessages = securityCodeInput.parentNode.querySelectorAll('.alert-danger');
  const securityCodeSuccessMessages = securityCodeInput.parentNode.querySelectorAll('.alert-success');

  const fecha = document.getElementById('fecha');
  const fechaErrorMessage = fecha.parentNode.querySelector('.alert-danger');
  const fechaSuccessMessage = fecha.parentNode.querySelector('.alert-success');

  const cardholderName = document.getElementById('cardholderName');
  const cardholderNameErrorMessages = cardholderName.parentNode.querySelector('.alert-danger');
  const cardholderNameSuccessMessages = cardholderName.parentNode.querySelector('.alert-success');

  const cardholderAddress = document.getElementById('cardholderAddress');
  const cardholderAddressErrorMessages = cardholderAddress.parentNode.querySelector('.alert-danger');
  const cardholderAddressSuccessMessages = cardholderAddress.parentNode.querySelector('.alert-success');

  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');

  let isCustomerNameValid;
  let isPhoneNumberValid;
  let isAddressValid;
  let isEmailValid;
  let isCardNumberValid;
  let isSecurityCodeValid;
  let isFechaValid;
  let isCardholderNameValid;
  let isCardholderAddressValid;

  const validateForm = () => {
    if (
      isCustomerNameValid &&
      isPhoneNumberValid &&
      isAddressValid &&
      isEmailValid &&
      isCardNumberValid &&
      isSecurityCodeValid &&
      isFechaValid &&
      isCardholderNameValid &&
      isCardholderAddressValid
    ) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  }
  const generarNumeroFactura = () => {
    let letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numero = Math.floor(Math.random() * 10000); // Genera un número aleatorio de 0 a 9999
    let letra = letras.charAt(Math.floor(Math.random() * letras.length)); // Elige una letra aleatoria
    
    // Completa con ceros a la izquierda si el número es menor a 1000
    let numeroFactura = numero.toString().padStart(4, '0');
    
    return numeroFactura + letra;
  }
  const generarFactura = () => {
    let actualDate = new Date();
    let day = actualDate.getDate().toString().padStart(2, '0');
    let month = (actualDate.getMonth() + 1).toString().padStart(2, '0'); // El mes se cuenta desde 0, por eso se suma 1
    let year = actualDate.getFullYear().toString();

    // Crear la cadena con el formato deseado
    let fechaFormateada = `${day}/${month}/${year}`;

    const customer = new Customers(customerName.value, address.value, phoneNumber.value, emailInput.value);
    const tarjetaDeCredito = new TarjetasDeCredito(cardNumberInput.value, securityCodeInput.value,fecha.value);
    const factura = new Factura(generarNumeroFactura(), fechaFormateada, customer, carrito, tarjetaDeCredito);
    factura.calcularTotal();
    console.log(factura)
    

    let facturacion = JSON.stringify(factura);
    sessionStorage.setItem("facturacion", facturacion);

    return factura;
  }
  renderCart();
  showCheckout();

  customerName.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/[^\w\s]/gi, "");
    const hasSpecialCharacters = /[^\w\s]/.test(inputValue);
    const hasNumbers = /\d/.test(inputValue);

    event.target.value = sanitizedValue;
     if (hasSpecialCharacters || hasNumbers || event.target.value.length < 9) {
      customerNameErrorMessage.style.display = "block";
      customerNameSuccessMessage.style.display = 'none';
      customerName.style.borderColor = '#ff2400';
      isCustomerNameValid = false;
    } else {
      customerNameErrorMessage.style.display = "none";
      customerNameSuccessMessage.style.display = 'block';
      customerName.style.borderColor = '#2ecc71';
      isCustomerNameValid = true;
    }
    validateForm();
  });
  phoneNumber.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    event.target.value = inputValue.replace(/\D/g, "");
    if (event.target.value.length < 9) {
      phoneNumberErrorMessage.forEach((errorMessage) => {
        errorMessage.style.display = 'block';
        phoneNumber.style.borderColor = '#ff2400'
      });
      phoneNumberSuccessMessage.forEach((successMessage) => {
        successMessage.style.display = 'none';
      });
      isPhoneNumberValid = false;
    } else {
      phoneNumberErrorMessage.forEach((errorMessage) => {
        errorMessage.style.display = 'none';
      });
      phoneNumberSuccessMessage.forEach((successMessage) => {
        successMessage.style.display = 'block';
        phoneNumber.style.borderColor = '#2ecc71';
      });
      isPhoneNumberValid = true;
    }
    validateForm();
  });
  address.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const hasSpecialCharacters = /[^\w\s]/.test(inputValue);
    const isValidLength = inputValue.length >= 6;
    if (hasSpecialCharacters || !isValidLength) {
      setAlertVisibility(addressErrorMessage, true);
      setAlertVisibility(addressSuccessMessage, false);
      address.style.borderColor = '#ff2400';
      isAddressValid = false;
    } else {
      setAlertVisibility(addressErrorMessage, false);
      setAlertVisibility(addressSuccessMessage, true);
      address.style.borderColor = '#2ecc71';
      isAddressValid = true;
    }
    validateForm();
  })
  emailInput.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const isValidEmail = /^\S+@\S+\.\S+$/.test(inputValue);
  
    if (isValidEmail) {
      setAlertVisibility(emailErrorMessage, false);
      setAlertVisibility(emailSuccessMessage, true);
      emailInput.style.borderColor = '#2ecc71';
      isEmailValid = true;
    } else {
      setAlertVisibility(emailErrorMessage, true);
      setAlertVisibility(emailSuccessMessage, false);
      emailInput.style.borderColor = '#ff2400';
      isEmailValid = false;
    }
  
    validateForm();
  });
  cardNumberInput.addEventListener('input', (event) => {
    const value = event.target.value.replace(/\D/g, '').substring(0, 16);
    const formattedValue = value.replace(/(\d{4})/g, '$1-');
    
    event.target.value = formattedValue.slice(0, 19);

    if (event.target.value.length > 18) {
      cardNumberErrorMessages.forEach((errorMessage) => {
        errorMessage.style.display = 'none';
      });
      cardNumberSuccessMessages.forEach((successMessage) => {
        successMessage.style.display = 'block';
        cardNumberInput.style.borderColor = '#2ecc71';
      });
      isCardNumberValid = true;
    } else {
      cardNumberErrorMessages.forEach((errorMessage) => {
        errorMessage.style.display = 'block';
        cardNumberInput.style.borderColor = '#ff2400'
      });
      cardNumberSuccessMessages.forEach((successMessage) => {
        successMessage.style.display = 'none';
      });
      isCardNumberValid = false;
    }
    validateForm();
  });
  securityCodeInput.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    event.target.value = inputValue.replace(/\D/g, "");
    if (event.target.value.length > 2) {
      securityCodeErrorMessages.forEach((errorMessage) => {
        errorMessage.style.display = 'none';
      });
      securityCodeSuccessMessages.forEach((successMessage) => {
        successMessage.style.display = 'block';
        securityCodeInput.style.borderColor = '#2ecc71';
      });
      isSecurityCodeValid = true;
    } else {
      securityCodeErrorMessages.forEach((errorMessage) => {
        errorMessage.style.display = 'block';
        securityCodeInput.style.borderColor = '#ff2400'
      });
      securityCodeSuccessMessages.forEach((successMessage) => {
        successMessage.style.display = 'none';
      });
      isSecurityCodeValid = false;
    }
    validateForm();
  });
  fecha.addEventListener('input', (event) => {
    if (event.target.value == '') {
      setAlertVisibility(fechaErrorMessage, true);
      setAlertVisibility(fechaSuccessMessage, false);
      fecha.style.borderColor = '#ff2400';
      isFechaValid = false;
    } else {
      setAlertVisibility(fechaErrorMessage, false);
      setAlertVisibility(fechaSuccessMessage, true);
      fecha.style.borderColor = '#2ecc71';
      isFechaValid = true;
    }
    validateForm();
  })
  cardholderName.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/[^\w\s]/gi, "");
    const hasSpecialCharacters = /[^\w\s]/.test(inputValue);
    const hasNumbers = /\d/.test(inputValue);

    event.target.value = sanitizedValue;
    if (hasSpecialCharacters || hasNumbers || event.target.value.length < 9) { 
      setAlertVisibility(cardholderNameErrorMessages, true);
      setAlertVisibility(cardholderNameSuccessMessages, false);
      cardholderName.style.borderColor = '#ff2400';
      isCardholderNameValid = false;
    } else {
      setAlertVisibility(cardholderNameErrorMessages, false);
      setAlertVisibility(cardholderNameSuccessMessages, true);
      cardholderName.style.borderColor = '#2ecc71';
      isCardholderNameValid = true;
    }
    validateForm();
  });
  cardholderAddress.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const hasSpecialCharacters = /[^\w\s]/.test(inputValue);
    const isValidLength = inputValue.length >= 6;
    if (hasSpecialCharacters || !isValidLength) {
      setAlertVisibility(cardholderAddressErrorMessages, true);
      setAlertVisibility(cardholderAddressSuccessMessages, false);
      cardholderAddress.style.borderColor = '#ff2400';
      isCardholderAddressValid = false;
    } else {
      setAlertVisibility(cardholderAddressErrorMessages, false);
      setAlertVisibility(cardholderAddressSuccessMessages, true);
      cardholderAddress.style.borderColor = '#2ecc71';
      isCardholderAddressValid = true;
    }
    validateForm();
  })
  submitBtn.addEventListener('click', (event) => {
    event.preventDefault();
    loading.style.display = 'flex';
    loading.className = loading.className + ' flex-column align-items-center justify-content-center'
    const checkoutForm = document.getElementById('checkout-form');
    factura = generarFactura();
    cliente = factura.cliente;
    productos = factura.productos;
    let productosHTML = '';
    let productosLista = '';

    productos.forEach((producto) => {
      productosHTML += `<p>Producto: ${producto.name}</p>`;
      productosLista += `Producto: ${producto.name}`;
    });

    content = `
    GoodGame Gaming Workshop:
    Fecha: ${factura.fecha}
    Número de factura: ${factura.numero}
    ---------------------------------
    Cliente: ${cliente.name}
    Email: ${cliente.emailAddress}
    Número de teléfono: ${cliente.phoneNumber}
    Dirección: ${cliente.address}
    ---------------------------------
    ${productosLista};
    ---------------------------------
    Tarjeta de crédito: MasterCard
    Banco: Banco de la República Argentina
    Titular: ${cliente.name}
    ---------------------------------
    Total: ${factura.total} ARS
    `;
    
    submitBtn.disabled = true;
    checkoutForm.style.display = 'none ';

    billPreview.innerHTML = ` <p class="h1">Vista previa de su factura</p>
    <div class="factura row">
      <div class="datos-factura col-6">
        <p class="h2"> Datos de la factura: </p>
        <p>Numero de factura: ${factura.numero}</p>
        <p>Fecha de emisión: ${factura.fecha}</p>
      </div>
      <div class="datos-cliente col-6">
        <p class="h2">Datos del cliente</p>
        <p>Nombre: ${cliente.name}</p>
        <p>Email: ${cliente.emailAddress}</p>
        <p>Número de teléfono: ${cliente.phoneNumber}</p>
        <p>Dirección: ${cliente.address}</p>
      </div>
      <div class="datos-productos col-6">
        <p class="h2">Datos de los productos </p>
        ${productosHTML}
      </div>
      <div class="datos-tarjeta col-6">
        <p class="h2">Datos de la tarjeta de crédito </p>
        <p>Tarjeta de crédito: MasterCard</p>
        <p>Banco: Banco de la República Argentina</p>
        <p>Titular: ${cliente.name}</p>
      </div>
      <p>Total: ${factura.total}</p>
    </div>
    <div class="buttons">
      <button type="button" class="btn btn-success" id="pdfBtn">Exportar PDF</button>
      <button class="btn btn-success" id="buyBtn">Comprar Ahora</button>
    </div>`
    const pdfBtn = document.getElementById('pdfBtn');
    const buyBtn = document.getElementById('buyBtn');
   
    // Evento de clic en el botón de exportar PDF
    pdfBtn.addEventListener('click', (event) => {
      event.preventDefault();
      const doc = new jsPDF();
      const contenido = content;
      doc.text(20, 20, contenido);
      doc.save('factura.pdf');
      event.preventDefault();

    });
    buyBtn.addEventListener('click', () => {
      localStorage.removeItem('cart');
      sessionStorage.removeItem('facturacion');
      loading.style.display = 'flex';
      loading.style.position = 'fixed';
      loading.style.top = '0';
      loading.style.left = '0';
      loading.style.width = '100%';
      loading.style.height = '100%';
      loading.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      loading.style.display = 'flex';
      loading.style.justifyContent = 'center';
      loading.style.alignItems = 'center';
  
      // Mostrar alerta de compra exitosa
    setTimeout(() => {
      localStorage.setItem('compraExitosa', 'true');
      window.location.href = 'productos.html';
  
  
    }, 2000); // Esperar 500 ms antes de mostrar la alerta
    })   
    setTimeout(() => {
      
      loading.style.display = 'none';
      toastr.success('Datos ingresados correctamente!');
      billPreview.style.display="flex";
      billPreview.style.flexDirection="column";

      // Habilitar nuevamente el botón de envío
      submitBtn.disabled = false;
    }, 2000);
});
 
} else if (currentPageUrl.endsWith('/index.html')) {

const sections = document.querySelectorAll('.fade-in-section');

const options = {
  threshold: 0.1 // Porcentaje del elemento visible necesario para que se active la animación
};
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
    } else {
      entry.target.style.opacity = '0'; // Restablecer la opacidad a 0 cuando se deja de observar
    }
  });
}, options);

sections.forEach(section => {
  observer.observe(section);
});

getData(8, currentPageUrl);
}
