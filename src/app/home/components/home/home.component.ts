import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, NavigationEnd } from '@angular/router';
// servicios
import { BitstampService } from '@core/services/bitstamp/bitstamp.service';
import { ClienteService } from '@core/services/cliente/cliente.service';
import { Cliente } from '@core/interface/cliente';
import * as Highcharts from 'highcharts';
import { ProveService } from '@core/services/prove/prove.service';
import { Proveedor } from '@core/interface/proveedor';
import { AuthService } from '@core/services/interceptor/auth.service';
import { User } from '@core/interface/user';
import { Formulario } from '@core/interface/formulario';
import { FormularioService } from '@core/services/formulario/formulario.service';
// import { CoinmonitorService } from '@core/services/coinmonitor/coinmonitor.service';
// import { CoinmarketcapService } from '@core/services/coinmarketcap/coinmarketcap.service';
import { format } from 'date-fns';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Tabla *****
  displayedColumns: string[] = ['created', 'state', 'number', 'title'];
  exampleDatabase: null;
  data = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  // *********

  // Para el efecto de las criptomonedas
  centered = false;
  disabled = false;
  unbounded = false;
  radius: number;
  color: string;
  // ****
  // variables para el calculo
  // tslint:disable-next-line: variable-name
  calc_com_prov = { prove: 0, vende: 0 };
  // tslint:disable-next-line: variable-name
  costo_dolar = { prove: 0, vende: 0 };
  // tslint:disable-next-line: variable-name
  costo_peso = { prove: 0, vende: 0 };
  // tslint:disable-next-line: variable-name
  costo_total = { prove: 0, vende: 0 };
  // bandera para indicar que fue emitido el presupuesto
  formularioDevuelto = false;
  // cuarda el proveedor
  proveedorSeleccionado: any = [];
  // Es el boton para realizar el presupuesto..lo almaceno en una variable para modificarlo
  botonAccion: string;
  // moneda seleccionada para mostrar contenido dependiendo de esta
  monedaSeleccionada = 'Dolar';
  // contiene el usuario login
  usuario: User;

  precioBitcoin: string;
  precioEthereum: string;
  precioLitecoin: string;

  fechaBitcoin: string;
  fechaEthereum: string;
  fechaLitecoin: string;

  Highcharts: typeof Highcharts = Highcharts;
  graficaBitcoin: Highcharts.Options;
  graficaLitecoin: Highcharts.Options;
  graficaEthereum: Highcharts.Options;
  webs = [
    { name: 'Bitstamp' },
    { name: 'Coinmarketcap' },
    { name: 'Coinmonitor' },
  ];
  monederos = [
    {name: 'Dolar'},
    {name: 'Euro'},
    {name: 'Peso'},
    {name: 'Criptomoneda'},
  ];

  // Para cargar todo los cliente
  clientes: Cliente[] = [];
  // Para cargar todo los proveedores
  proveedores: Proveedor[] = [];
  // Para enviar formlario
  frmNuevo: Formulario;
  // Formulario
  formCriptomoneda = this.fb.group({
    id: [null],
    web: [null, Validators.required],
    monedero: [null, Validators.required],
    comision_prove: [null, Validators.required],
    comision_vendedor: [null, Validators.required],
    criptomoneda: [null, Validators.required],
    tipo_criptomoneda: [null],
    importe_compra: [null, Validators.required],
    dolar: [null, Validators.required],
    estado: [null],
    fecha_compra: [null],
    cliente_id: [null, Validators.required],
    proveedor_id: [null, Validators.required],
    user_id: [null],
  });
  mySubscription: any;
  constructor(
    private router: Router,
    private bitstampService: BitstampService,
    private clienteService: ClienteService,
    private proveService: ProveService,
    private fb: FormBuilder,
    private authService: AuthService,
    private formularioService: FormularioService
  ) {
    this.botonAccion = 'Presupuestar';
    this.usuario = this.authService.currentUserValue;
    // seteo el usuario para el formulario..
    this.formCriptomoneda.controls.user_id.setValue(this.usuario.id);
    // obtengo todo los cliente para selector
    this.clienteService.getClientes()
        .subscribe(clientes => { this.clientes = clientes; });

    // obtengo todo los proveedores para el selector
    this.proveService.getProveedores()
        .subscribe(proveedores => {this.proveedores  = proveedores; });
    // doy formato al grafico
    this.graficaBitcoin = {
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: []
      },
      yAxis: {
        title: {
          text: ''
        }
      },
      series: [
        {
          data: [],
          type: 'line'
        }
      ]
    };
    // hago copia del formato grafico
    this.graficaLitecoin = this.graficaBitcoin;
    this.graficaEthereum = this.graficaBitcoin;

  }

  ngOnInit(): void {
    // configuro la strategy para recarga de la pagina..
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  getWeb(webSeleccionada) {
    console.log(webSeleccionada);
    // obtengo para la web seleccionada..
    this.obtenerBitcoins();
    this.obtenerEthereum();
    this.obtenerLitecoin();
    // seteo la web
    this.formCriptomoneda.controls.web.setValue(webSeleccionada);
  }

  obtenerBitcoins() {
    this.bitstampService.getBitcoinTransactions().subscribe(
      monedas => {
        const transactionBitstamp = monedas;
        // tslint:disable-next-line: no-string-literal
        this.precioBitcoin = monedas[0]['price'];
        this.fechaBitcoin = format(new Date(),  'yyyy-MM-dd HH:mm:ss'); // midata[0]['date'];
        const precio = transactionBitstamp.map(x => parseFloat(x.price));
        // tslint:disable-next-line: no-string-literal
        this.graficaBitcoin.series[0]['data'] = precio.reverse();
        // this.graficaBitcoin.xAxis['categories'] = fecha;
        Highcharts.chart('graficaBitcoin', this.graficaBitcoin);
      }
    );
  }
  obtenerEthereum() {
    this.bitstampService.getEthereumTransactions().subscribe(
      monedas => {
        const transactionEthereum = monedas;
        // tslint:disable-next-line: no-string-literal
        this.precioEthereum = monedas[0]['price'];
        this.fechaEthereum = format(new Date(),  'yyyy-MM-dd HH:mm:ss'); // midata[0]['date'];
        const precio = transactionEthereum.map(x => parseFloat(x.price));
        // tslint:disable-next-line: no-string-literal
        this.graficaEthereum.series[0]['data'] = precio.reverse();
        // this.graficaBitcoin.xAxis['categories'] = fecha;
        Highcharts.chart('graficaEthereum', this.graficaEthereum);
      }
    );
  }
  obtenerLitecoin() {
    this.bitstampService.getLitecoinTransactions().subscribe(
      monedas => {
        const transactionLitecoin = monedas;
        // tslint:disable-next-line: no-string-literal
        this.precioLitecoin = monedas[0]['price'];
        this.fechaLitecoin = format(new Date(), 'yyyy-MM-dd HH:mm:ss'); // midata[0]['date'];
        const precio = transactionLitecoin.map(x => parseFloat(x.price));
        // tslint:disable-next-line: no-string-literal
        this.graficaLitecoin.series[0]['data'] = precio.reverse();
        // this.graficaBitcoin.xAxis['categories'] = fecha;
        Highcharts.chart('graficaLitecoin', this.graficaLitecoin);
      }
    );
  }

  // aca voy a cambiar el cartel de la moneda de cambio, para cuando es Euro que muestre este valor.
  seleccionMonedero(moneda) {
    this.monedaSeleccionada = 'Dolar';
    if (moneda === 'Euro') {
      this.monedaSeleccionada = 'Euro';
    }
  }

  criptomonedaSeleccionada(criptomoneda, tipo) {
    // this.tipoCripto = tipo;
    // seteo el valor de tipo_criptomoneda es 'bitcoin', 'Ethereum', 'Litecoin'
    this.formCriptomoneda.controls.tipo_criptomoneda.setValue(tipo);
    // seteo el valor de criptomoneda...para ingresar el valor en el input de criptomoneda
    this.formCriptomoneda.controls.criptomoneda.setValue(criptomoneda);
    // seteo la fecha, utilizo la de bitcoin porque las tres tienen el mismo valor de fecha..
    this.formCriptomoneda.controls.fecha_compra.setValue(this.fechaBitcoin);
  }

  seleccionProveedor(proveedor) {
    // Guardo el proveedor para mostrarlo en el detalle
    this.proveedorSeleccionado = proveedor;
    // seteo el valor de proveedor para mostrar en detalle
    this.formCriptomoneda.controls.proveedor_id.setValue(proveedor.id);
  }
  seleccionCliente(cliente) {
    // seteo el valor del cliente para mostrar en detalle
    this.formCriptomoneda.controls.cliente_id.setValue(cliente);
  }

  onSubmit() {
    // si es valido y esta en false quiere decir q vamos a crear un presupuesto..
    if (this.formCriptomoneda.valid ) {
      // this.formularioDevuelto = new Formulario();
      // console.log('comision_p', this.formCriptomoneda.value.comision_prove);
      // console.log('comision_v', this.formCriptomoneda.value.comision_vendedor);
      // console.log('criptomoneda', this.formCriptomoneda.value.criptomoneda);
      // console.log('dolar', this.formCriptomoneda.value.dolar);
      // console.log('importe_compra', this.formCriptomoneda.value.importe_compra);
      // console.log('monedero', this.formCriptomoneda.value.monedero);

      // Seteo los valores para hacer la conversion..
      this.formCriptomoneda.controls.comision_prove.setValue(parseFloat(this.formCriptomoneda.value.comision_prove));
      this.formCriptomoneda.controls.comision_vendedor.setValue(parseFloat(this.formCriptomoneda.value.comision_vendedor));
      this.formCriptomoneda.controls.criptomoneda.setValue(parseFloat(this.formCriptomoneda.value.criptomoneda));
      this.formCriptomoneda.controls.dolar.setValue(parseFloat(this.formCriptomoneda.value.dolar));
      this.formCriptomoneda.controls.importe_compra.setValue(parseFloat(this.formCriptomoneda.value.importe_compra));
      // hago los calculo
      this.calcularProveedor(
        this.formCriptomoneda.value.comision_prove,
        this.formCriptomoneda.value.comision_vendedor,
        this.formCriptomoneda.value.criptomoneda,
        this.formCriptomoneda.value.dolar,
        this.formCriptomoneda.value.importe_compra,
        this.formCriptomoneda.value.monedero);

      // ahora si esta en this.formularioDevuelto === true quiere decir q ya se genero el presupuesto, por lo tanto actualizamos
      if (this.formularioDevuelto === false) {
        this.formularioDevuelto = true;
        // seteo al estado en presupuesto..
        this.formCriptomoneda.controls.estado.setValue('P');
        // console.log('onsubmit', this.formCriptomoneda.value);
        this.formularioService.crearFormulario(this.formCriptomoneda.value).subscribe(data => {
          // Cambio el contenido del boton del formulario..
          this.botonAccion = 'Actualizar';
          // seteo el id, para si es necesario hacer la venta(update por id del formulario)..
          this.formCriptomoneda.controls.id.setValue(data.id);
        });
      } else {
        // estoy actualizando el mismo formulario ya guardad como presupuesto..
        if (this.formCriptomoneda.value.id !== null) {
          this.formularioService.actualizarFormulario(this.formCriptomoneda.value).subscribe(data => {
            console.log(data);
            // this.formCriptomoneda.controls.estado.setValue(data.estado);
          });
        }
      }

    }
  }

  // tslint:disable-next-line: variable-name
  calcularProveedor( comision_p, comision_v, cotizacion_cripto, cotizacion_dolar, cliente_compra, moneda) {
    // console.log(moneda);
    // calc_com_prov = { prove: 0, vende: 0 };
    this.calc_com_prov.prove = (comision_p * cotizacion_cripto) / 100;
    this.calc_com_prov.vende = (comision_v * cotizacion_cripto) / 100;
    // console.log((comision_p * cotizacion_cripto) / 100);
    // console.log((comision_v * cotizacion_cripto) / 100);

    this.costo_dolar.prove  = this.calc_com_prov.prove + cotizacion_cripto;
    this.costo_dolar.vende  = this.calc_com_prov.vende + cotizacion_cripto;
    // console.log(this.calc_com_prov.prove + cotizacion_cripto);
    // console.log(this.calc_com_prov.vende + cotizacion_cripto);

    if (moneda === 'Dolar' || moneda === 'Euro') {
      this.costo_total.prove = cliente_compra / this.costo_dolar.prove ;
      this.costo_total.vende = cliente_compra / this.costo_dolar.vende ;
      // console.log(cliente_compra / this.costo_dolar.prove );
      // console.log(cliente_compra / this.costo_dolar.vende );

      this.costo_peso.prove = cliente_compra * cotizacion_dolar;
      this.costo_peso.vende = cliente_compra * cotizacion_dolar;
      // console.log(cliente_compra * cotizacion_dolar);
    }

    if (moneda === 'Peso') {
      this.costo_peso.prove = this.costo_dolar.prove  * cotizacion_dolar;
      this.costo_peso.vende = this.costo_dolar.vende  * cotizacion_dolar;
      // console.log(this.costo_dolar.prove * cotizacion_dolar);
      // console.log(this.costo_dolar.vende * cotizacion_dolar);

      this.costo_total.prove = cliente_compra / this.costo_peso.prove ;
      this.costo_total.vende = cliente_compra / this.costo_peso.vende ;
      // console.log(cliente_compra / this.costo_peso.prove );
      // console.log(cliente_compra / this.costo_peso.vende );
    }

    if ( moneda === 'Criptomoneda') {
      this.costo_total.prove = this.costo_dolar.prove * cliente_compra;
      this.costo_total.vende = this.costo_dolar.vende * cliente_compra;
      // console.log(this.costo_dolar.prove * cliente_compra);
      // console.log(this.costo_dolar.vende * cliente_compra);

      this.costo_peso.prove = this.costo_total.prove * cotizacion_dolar;
      this.costo_peso.vende = this.costo_total.vende * cotizacion_dolar;
      // console.log(this.costo_total.prove * cotizacion_dolar);
      // console.log(this.costo_total.vende * cotizacion_dolar);
    }

  }

  vender() {
    // console.log(this.formCriptomoneda);
    if (this.formCriptomoneda.value.id !== null) {
      this.formCriptomoneda.controls.estado.setValue('V');
      this.formularioService.actualizarFormulario(this.formCriptomoneda.value).subscribe(data => {
        console.log(data);
        // this.formCriptomoneda.controls.estado.setValue(data.estado);
        // recargo la pagina
        this.router.navigateByUrl('home');
      });
    }
  }

  borrar() {
    if (this.formCriptomoneda.value.id !== null) {
      this.formularioService.eliminarFormulario(this.formCriptomoneda.value).subscribe(data => {
        // console.log(data);
        this.router.navigateByUrl('home');
      });
    }
  }

  nuevoFormulario() {
    this.router.navigateByUrl('home');
  }

}
