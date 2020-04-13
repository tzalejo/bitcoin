import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { MatSort } from '@angular/material/sort';
import { Router, NavigationEnd } from '@angular/router';
// servicios
import { BitstampService } from '@core/services/bitstamp/bitstamp.service';
import { ClienteService } from '@core/services/cliente/cliente.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Cliente } from '@core/interface/cliente';
import * as Highcharts from 'highcharts';
import { ProveService } from '@core/services/prove/prove.service';
import { Proveedor } from '@core/interface/proveedor';
import { AuthService } from '@core/services/interceptor/auth.service';
import { User } from '@core/interface/user';
import { Formulario } from '@core/interface/formulario';
import { FormularioService } from '@core/services/formulario/formulario.service';
import { format } from 'date-fns';

export interface TablaFormulario {
  'fecha': string;
  'estado': string;
  'cliente': string;
  'compra_moneda': string;
  'cotizacion': string;
  'prove': string;
  'pc_prove': string;
  'pc_venta': string;
  'importe': string;
  'criptomoneda': string;
  'valor_comision_prove': string;
  'valor_comision_vendedor': string;
  'g_euro': string;
  'g_dolar': string;
  'g_peso': string;
  'g_criptomoneda': string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  // Tabla ***** ELEMENT_DATA
  // dataSource = [];
  columnsToDisplay = [
    'fecha', 'importe', 'criptomoneda', 'valor_comision_prove',
    'valor_comision_vendedor', 'g_dolar', 'g_euro', 'g_peso', 'g_criptomoneda'];
  expandedElement: TablaFormulario | null;
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<any>;
  tablaFormularios = [];
  // Para el efecto de las criptomonedas
  centered = false;
  disabled = false;
  unbounded = false;
  radius: number;
  color: string;
  // ****
  // variables para el calculo
  // tslint:disable-next-line: variable-name
  calc_comosion = { prove: 0, vende: 0 };
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
  // variable para las ganancia
  gananciaPeso: number;
  gananciaDolar: number;
  gananciaCriptomoneda: number;
  /** */

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
  compra_monedas = [
    { name: 'Dolar' },
    { name: 'Euro' },
    { name: 'Peso' },
    { name: 'Criptomoneda' },
  ];

  // Para guardar un cliente y proveedor para cuando agrego desde el formulario.
  cliente: Cliente;
  proveedor: Proveedor;

  // Para cargar todo los cliente
  clientes: Cliente[] = [];
  // Para cargar todo los proveedores
  proveedores: Proveedor[] = [];
  // Formulario
  formCriptomoneda = this.fb.group({
    id: [null],
    web: [null, Validators.required],
    compra_moneda: [null, Validators.required], // cambio el monedero
    comision_prove: [null, Validators.required],
    comision_vendedor: [null, Validators.required],
    valor_comision_prove: [null], // valor de la comision prove
    valor_comision_vendedor: [null], // valor de la comision vendedor
    criptomoneda: [null, Validators.required],
    tipo_criptomoneda: [null],
    importe_compra: [null, Validators.required],
    dolar: [null, Validators.required],
    estado: [null],
    // es cuanto sale la criptomoneda con respecto a la comision del proveedor (comision + criptomoneda)
    costo_criptomoneda_p: [null],
    // es cuanto sale la criptomoneda con respecto a la comision del vendedor (comision + criptomoneda)
    costo_criptomoneda_v: [null],
    // almacenare la ganancia en criptomoneda
    ganacia_criptomoneda: [null],
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
    this.actualizarClientes();
    this.actualizarProveedores();

    // seteo los grafico
    this.seteoGrafico();

    this.actualizoTablaFormulario();
    this.getWeb('Bitstamp');
  }

  seteoGrafico() {
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

  actualizoTablaFormulario() {
    this.formularioService.getFormularios()
    .subscribe(formularios => {

      this.dataSource =  new MatTableDataSource(formularios);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
    });
  }

  actualizarClientes() {
    // obtengo todo los cliente para selector
    this.clienteService.getClientes()
      .subscribe(clientes => { this.clientes = clientes; });
  }
  actualizarProveedores() {
    // obtengo todo los proveedores para el selector
    this.proveService.getProveedores()
      .subscribe(proveedores => { this.proveedores = proveedores; });
  }
  ngOnInit(): void {
    // configuro la strategy para recarga de la pagina..
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  getWeb(webSeleccionada) {
    // console.log(webSeleccionada);
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
        this.fechaBitcoin = format(new Date(), 'yyyy-MM-dd HH:mm:ss'); // midata[0]['date'];
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
        this.fechaEthereum = format(new Date(), 'yyyy-MM-dd HH:mm:ss'); // midata[0]['date'];
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
    console.log('inicio submit', this.formCriptomoneda.value);
    if (this.formCriptomoneda.valid) {
      // Seteo los valores para hacer la conversion..
      this.formCriptomoneda.controls.comision_prove.setValue(parseFloat(this.formCriptomoneda.value.comision_prove));
      this.formCriptomoneda.controls.comision_vendedor.setValue(parseFloat(this.formCriptomoneda.value.comision_vendedor));
      this.formCriptomoneda.controls.criptomoneda.setValue(parseFloat(this.formCriptomoneda.value.criptomoneda));
      this.formCriptomoneda.controls.dolar.setValue(parseFloat(this.formCriptomoneda.value.dolar));
      this.formCriptomoneda.controls.importe_compra.setValue(parseFloat(this.formCriptomoneda.value.importe_compra));

      // saco le valor porcentaje de la comision
      // tslint:disable-next-line: max-line-length
      this.formCriptomoneda.controls.valor_comision_prove.setValue((this.formCriptomoneda.value.comision_prove * this.formCriptomoneda.value.criptomoneda) / 100);
      // tslint:disable-next-line: max-line-length
      this.formCriptomoneda.controls.valor_comision_vendedor.setValue((this.formCriptomoneda.value.comision_vendedor * this.formCriptomoneda.value.criptomoneda) / 100);

      // obtengo el valor la comision + criptomoneda
      // tslint:disable-next-line: max-line-length
      this.formCriptomoneda.controls.costo_criptomoneda_p.setValue(this.formCriptomoneda.value.criptomoneda + this.formCriptomoneda.value.valor_comision_prove);
      // tslint:disable-next-line: max-line-length
      this.formCriptomoneda.controls.costo_criptomoneda_v.setValue(this.formCriptomoneda.value.criptomoneda + this.formCriptomoneda.value.valor_comision_vendedor);

      // tslint:disable-next-line: max-line-length
      const importe_compra = this.formCriptomoneda.value.importe_compra * (this.formCriptomoneda.value.compra_moneda === 'Criptomoneda' ? (this.formCriptomoneda.value.costo_criptomoneda_v) : 1);
      if (this.formCriptomoneda.value.compra_moneda === 'Dolar' ||
        this.formCriptomoneda.value.compra_moneda === 'Euro' ||
        this.formCriptomoneda.value.compra_moneda === 'Criptomoneda') {
        // obtengo la criptomonedas con respecto a la comision del proveedor y vendedor

        this.costo_total.prove = (importe_compra / this.formCriptomoneda.value.costo_criptomoneda_p);
        this.costo_total.vende = (importe_compra / this.formCriptomoneda.value.costo_criptomoneda_v);

        // criptomoneda
        this.gananciaCriptomoneda = this.costo_total.prove - this.costo_total.vende;
        this.formCriptomoneda.controls.ganacia_criptomoneda.setValue(this.gananciaCriptomoneda);
        // dolar
        this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.criptomoneda);
      }

      if (this.formCriptomoneda.value.compra_moneda === 'Peso') {
        // obtengo la criptomonedas con respecto a la comision(en dolar) del proveedor y vendedor
        // tslint:disable-next-line: max-line-length
        this.costo_total.prove = this.formCriptomoneda.value.importe_compra / (this.formCriptomoneda.value.costo_criptomoneda_p * this.formCriptomoneda.value.dolar);
        // tslint:disable-next-line: max-line-length
        this.costo_total.vende = this.formCriptomoneda.value.importe_compra / (this.formCriptomoneda.value.costo_criptomoneda_v * this.formCriptomoneda.value.dolar);

        // criptomoneda
        this.gananciaCriptomoneda = this.costo_total.prove - this.costo_total.vende;
        this.formCriptomoneda.controls.ganacia_criptomoneda.setValue(this.gananciaCriptomoneda);
        // dolar
        this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.costo_criptomoneda_p);
      }
      // peso
      this.gananciaPeso = (this.gananciaDolar * this.formCriptomoneda.value.dolar);

      // Cuando selecciono Criptomoneda tengo q cambiar a dolar.. para q realice los calculo con esta configuracion
      if (this.formCriptomoneda.value.compra_moneda === 'Criptomoneda') {
        this.formCriptomoneda.controls.compra_moneda.setValue('Dolar');
        // tslint:disable-next-line: max-line-length
        this.formCriptomoneda.controls.importe_compra.setValue(this.formCriptomoneda.value.importe_compra * this.formCriptomoneda.value.costo_criptomoneda_v);
      }

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
    console.log('fin submit', this.formCriptomoneda.value);
  }

  venderMoneda() {
    // console.log(this.formCriptomoneda);
    if (this.formCriptomoneda.value.id !== null) {
      this.formCriptomoneda.controls.estado.setValue('V');
      this.formularioService.actualizarFormulario(this.formCriptomoneda.value).subscribe(data => {
        console.log(data);
        // this.formCriptomoneda.controls.estado.setValue(data.estado);
        // recargo la pagina
        this.nuevoFormulario();
      });
    }
  }

  borrarMoneda() {
    if (this.formCriptomoneda.value.id !== null) {
      this.formularioService.eliminarFormulario(this.formCriptomoneda.value).subscribe(data => {
        // console.log(data);
        this.nuevoFormulario();
      });
    }
  }

  // vamos resetear..
  nuevoFormulario() {
    // reseteo formulario
    this.formCriptomoneda.reset();
    this.formDirective.resetForm();
    this.botonAccion = 'Presupuestar';
    this.seteoGrafico();
    this.getWeb('Bitstamp'); // actualizo los valores de la criptomoneda..
    this.actualizoTablaFormulario();
    // bandera para indicar que fue emitido el presupuesto
    this.formularioDevuelto = false;
    // seteo el usuario para el formulario..
    this.formCriptomoneda.controls.user_id.setValue(this.usuario.id);
    // this.router.navigateByUrl('home');
  }


  async agregarCliente() {
    const { value: apellido } = await Swal.fire({
      title: 'Ingrese Apellido del Cliente',
      input: 'text',
      inputPlaceholder: 'Ingrese Apellido',
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value.length === 0) {
            resolve('Ingrese el apellido');
          } else {
            resolve();
          }
        });
      }
    });
    if (apellido) {
      this.clienteService.crearCliente({ apellido, nombre: '', email: '', telefono: '' }).subscribe(data => {
        // console.log(data);
        this.cliente = data;
        this.actualizarClientes();
        // seteo con el nuevo cliente
        this.formCriptomoneda.controls.cliente_id.setValue(data.id);
      });
    }

  }

  async agregarProveedor() {
    const { value: apellido } = await Swal.fire({
      title: 'Ingrese Apellido del Proveedor',
      input: 'text',
      inputPlaceholder: 'Ingrese Apellido',
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value.length === 0) {
            resolve('Ingrese el apellido');
          } else {
            resolve();
          }
        });
      }
    });
    if (apellido) {
      // agrego el nuevo proveedor..con solo el apellido..
      this.proveService.crearProveedor({ apellido, nombre: '', email: '', telefono: '' })
        .subscribe(data => {
          // console.log(data);
          this.actualizarProveedores();
          this.proveedor = data;
          this.proveedorSeleccionado = data;
          this.formCriptomoneda.controls.proveedor_id.setValue(data.id);
        });
    }
  }


  /** Gets the total cost of all transactions. */
  // getTotalCripto() {
  //   return this.dataSource.map(t => parseFloat(t.ganacia_criptomoneda)).reduce((acc, value) => acc + value, 0);
  // }
  // getTotalDolar() {
  //   return this.dataSource.map(t => t.ganacia_criptomoneda).reduce((acc, value) => 0, 0);
  // }
  // getTotalPeso() {
  //   return this.dataSource.map(t => t.ganacia_criptomoneda).reduce((acc, value) => 0, 0);
  // }
  // getTotalEuro() {
  //   return this.dataSource.map(t => t.ganacia_criptomoneda).reduce((acc, value) => 0, 0);
  // }
}


// tslint:disable-next-line: only-arrow-functions
// formularios.map( function(item) {
//   tabla.push({
//     'fecha': item.fecha_compra,
//     'estado': item.estado,
//     'cliente': item.cliente,
//     'moneda': item.tipo_criptomoneda,
//     'cotizacion': item.dolar,
//     'prove': item.proveedor,
//     'pc_prove': item.comision_prove,
//     'pc_venta': item.comision_vendedor,
//     'importe': item.importe_compra,
//     'criptomoneda': item.criptomoneda,
//     'calculo_comision': (item.pc_prove*item.criptomoneda / 100)  // (comision_prove * criptomoneda) / 100;
//     'total_costo_prove': (((item.criptomoneda * item.comision_prove) / 100) + item.criptomoneda),
//     'total_costo_venta': (((item.criptomoneda * item.comision_vendedor) / 100) + item.criptomoneda),
//     'g_dolar': '',
//     'g_peso': '',
//     'g_criptomoneda': '',
//   });
// });
// // this.tablaFormularios = tabla;
// console.log(tabla);
// return tabla;
