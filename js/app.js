'use strict';
import { Producto } from './classes/PRODUCTO.js';
import { Customers } from './classes/customers.js';
import { Factura } from './classes/factura.js';
import { TarjetasDeCredito } from './classes/tarjetasdecredito.js';
const { jsPDF } = window.jspdf

const toastr = window.toastr;

const tlou = new Producto(1,"The Last Of Us" , "PS3,PS4,PS5,PC", 60, "https://i.blogs.es/b9a176/image_2022-06-09_222051649/840_560.png")
const gtav = new Producto(2, "Grand Theft Auto V", "PS3,PS4,PS5, XBOX, PC", 39.98, "https://i.blogs.es/dfbccc/trucosgtavps4/1366_2000.jpg");
const sonsoftheforest = new Producto(3, "Sons of The Forest", "PC", 29.99, "https://errekgamer.com/wp-content/uploads/2023/01/Presentan-Sons-of-the-Forest-la-secuela-del-aclamado-The-Forest.jpg");
const rdr2 = new Producto(4, "Red Dead Redemption 2", "PC", 29.20, "https://as01.epimg.net/meristation/imagenes/2018/10/22/header_image/87072801540239406.jpg");
const hogwartsLegacy = new Producto(5, "Hogwarts Legacy", "PC/PS4/PS5", 59.99, "https://media.tycsports.com/files/2023/02/12/533536/hogwarts-legacy-_1440x810_wmk.webp");
const re4Remake = new Producto(6, "Resident Evil 4 Remake", "PC,PS4,PS5,XBOX", 59.99, "https://img.youtube.com/vi/b9OEQAW5m2k/maxresdefault.jpg");

const productos = [tlou, gtav, sonsoftheforest, rdr2, hogwartsLegacy, re4Remake];
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
  console.log(carrito);
} else {
  
}
//Calculadora de precio de videojuegos de Steam Argentina.
const convertirPesoArgentino = (valorProd) => {
  divisaConvertida = valorProd * valorDolar;
  return divisaConvertida;
}
const calcularImpuestos = (base) => {
    let ganancias = base * GANANCIAS;
    let pais = (base * PAIS);
    totalImpuestos = base + ganancias + pais;
    return totalImpuestos;
}
// Crear elementos HTML para los productos
const createProductsDom = () => {
  const productContainer = document.getElementById('products');
  const cardsContainer = productContainer.querySelector(".cards");
  for (let i = 0; i < productos.length; i++) {
    const product = productos[i];
    const card = `
    <div class="card">
        <div class="image">
            <img src="${product.imgUri}" alt="">
        </div>
        <div class="content">
            <div class=" card-title my-4">
              <p class="h4">${product.nombre}</p>
              <p class="h5">Plataforma ${product.detalle}</p>
            </div>
            <div class=" body ">
              <p class="card-text">Precio: ${product.precio} DLS</p>
              <button class="btn button addBtn" type="button" data-id="${product.id}">Agregar al carrito</button>
            </div>
        </div>
    </div>
  `;
  cardsContainer.innerHTML += card;
  }
  // Agregar evento de clic en el botón "Agregar al carrito"
  const addBtn = document.querySelectorAll('.addBtn');
  for (let i = 0; i < addBtn.length; i++) {
    addBtn[i].addEventListener('click', (event) => {
      const productId = event.target.dataset.id; // obtener el ID del producto correspondiente al botón que se ha hecho clic
      let addedProduct = productos.find(product => product.id == productId);
      carrito.push(addedProduct);
      toastr.success(`El producto ${addedProduct.nombre} ha sido agregado al carrito`);
      renderCart();
    });
  }
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
  checkoutContainer.innerHTML = ``;
  let checkoutInfo = ``;
  total = 0; // reiniciar la variable total al comienzo de la función
  for (const product of carrito) {
    const cartItem = `
      <div class="cart-item d-flex flex-row my-3">
        <div class="image my-auto">
          <img src="${product.imgUri}" alt="">
        </div>
        <div class="content ">
          <p>${product.nombre}</p>
          <p>Precio: ${product.precio}DLS</p>
          <button class="btn button delBtn" type="button" data-id="${product.id}">Eliminar del carrito</button>
        </div>
      </div>
    `;
    checkoutContainer.innerHTML += cartItem;
  } 
  if (carrito.length > 0) {
    total = carrito.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.precio;
    }, 0);
    divisaConvertida = convertirPesoArgentino(total);
    totalImpuestos = calcularImpuestos(divisaConvertida);
    totalImpuestos = totalImpuestos.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'});
    formatedTotal = totalImpuestos;
    checkoutInfo = `
      <div class="buyInfo d-flex flex-column align-items-center p-2 rounded">
        <p class="text-muted">El valor se convierte a pesos y se le agregan los impuestos correspondientes </p>
        <p class="text-center total">Total: ${formatedTotal} ARS</p>
      </div>
    `;
    checkoutContainer.innerHTML += checkoutInfo;
    localStorage.setItem('cart', JSON.stringify(carrito));
  } else {
    cartTitle.textContent = 'No hay productos en su carrito';
  }
  delBtns();
}
// Crear elementos HTML para el carrito
const renderCart = () => {
  cartContainer.innerHTML = ``;
  let buyInfo = ``;
  total = 0; // reiniciar la variable total al comienzo de la función
  for (const product of carrito) {
    const cartItem = `
      <div class="cart-item d-flex flex-row my-3">
        <div class="image">
          <img src="${product.imgUri}" alt="">
        </div>
        <div class="content">
          <p>${product.nombre}</p>
          <p>Precio: ${product.precio}DLS</p>
          <button class="btn button delBtn" type="button" data-id="${product.id}">Eliminar del carrito</button>
        </div>
      </div>
    `;
    cartContainer.innerHTML += cartItem;
  } 

  if (carrito.length > 0) {
    cartTitle.textContent = 'Su compra';
    total = carrito.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.precio;
    }, 0);
    divisaConvertida = convertirPesoArgentino(total);
    totalImpuestos = calcularImpuestos(divisaConvertida);
    totalImpuestos = totalImpuestos.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'});
    formatedTotal = totalImpuestos;
    buyInfo = `
      <div class="buyInfo bg-dark d-flex flex-column align-items-center p-2 rounded">
        <p class="text-center total">Total: ${formatedTotal} ARS</p>
        <p class="text-muted">El valor se convierte a pesos y se le agregan los impuestos correspondientes </p>
        <a href="../pages/compra.html"> <button type="button" class="btn button"> Comprar Ahora </button> </a>
      </div>
    `;
    cartContainer.innerHTML += buyInfo;
    localStorage.setItem('cart', JSON.stringify(carrito));
  } else {
    cartTitle.textContent = 'No hay productos en su carrito';
  }
  delBtns()
}

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
  createProductsDom();
  if(carrito !== null ) {
    renderCart();
  }
} else if (currentPageUrl.endsWith('/compra.html')) {

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
    
    console.log(factura);

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
    console.log(event.target.value);
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
  submitBtn.addEventListener('click', () => {
    loading.style.display = 'flex';
    loading.className = loading.className + ' flex-column align-items-center justify-content-center'
    const checkoutForm = document.getElementById('checkout-form');
    const factura = generarFactura();
    const cliente = factura.cliente;
    const productos = factura.productos;
    let productosHTML = '';
    let productosLista = '';

    productos.forEach((producto) => {
      productosHTML += `<p>Producto: ${producto.nombre}</p>`;
      productosLista += `Producto: ${producto.nombre}`;
    });
    submitBtn.disabled = true;
    checkoutForm.style.display = 'none ';
    setTimeout(function() {
      // Ocultar el elemento de carga
      loading.style.display = 'none';
      toastr.success('Datos ingresados correctamente!');
      checkoutForm.outerHTML = `
        <div class="col-md-7 m-3 p-4 checkout-preview rounded">
          <p class="h1">Vista previa de su factura</p>
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
            <button class="btn btn-success" id="pdfBtn">Exportar PDF</button>
            <button class="btn btn-success" id="buyBtn">Comprar Ahora</button>
          </div>
        </div>
      `;
    
      const pdfBtn = document.getElementById('pdfBtn');
      const buyBtn = document.getElementById('buyBtn');
      const content = `
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

      // Evento de clic en el botón de exportar PDF
      pdfBtn.addEventListener('click', () => {
        const doc = new jsPDF();
        const contenido = content;
        doc.text(20, 20, contenido);
        doc.save('factura.pdf');
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
        window.location.href = 'productos.html';

      }, 2000); // Esperar 500 ms antes de mostrar la alerta
      })
    
      // Resto de tu código aquí...
    
      // Habilitar nuevamente el botón de envío
      submitBtn.disabled = false;
    }, 2000);
});
}
