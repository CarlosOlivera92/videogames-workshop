export class Factura {
    constructor(numero, fecha, cliente, productos, tarjetaCredito) {
        this.numero = numero;
        this.fecha = fecha;
        this.cliente = cliente;
        this.productos = productos;
        this.tarjetaCredito = tarjetaCredito;
        this.total = 0;
    }
    calcularTotal() {
        const GANANCIAS = 0.45;
        const PAIS = 0.30;
        this.total = this.productos.reduce((total, producto) => {
          const precio = parseFloat(producto.precio); // Convertir el precio a número
          if (!isNaN(precio)) {
            return total + precio;
          } else {
            return total;
          }
        }, 0);
      
        let divisaConvertida = this.total * 470;
        let ganancias = divisaConvertida * GANANCIAS;
        let pais = divisaConvertida * PAIS;
        let totalImpuestos = divisaConvertida + ganancias + pais;
        let formatedTotal = totalImpuestos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
        this.total = formatedTotal;
    }
}