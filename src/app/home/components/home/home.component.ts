import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
// servicios
import { BitstampService } from '@core/services/bitstamp/bitstamp.service';
import { ClienteService } from '@core/services/cliente/cliente.service';
import { Cliente } from '@core/interface/cliente';
import * as Highcharts from 'highcharts';
import { ProveService } from '@core/services/prove/prove.service';
import { Proveedor } from '@core/interface/proveedor';
import { AuthService } from '@core/services/interceptor/auth.service';
import { User } from '@core/interface/user';
// import { CoinmonitorService } from '@core/services/coinmonitor/coinmonitor.service';
// import { CoinmarketcapService } from '@core/services/coinmarketcap/coinmarketcap.service';

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
  // almaceno el tipo de criptomoneda seleccionado..
  tipoCripto: string;
  // moneda seleccionada para mostrar contenido dependiendo de esta
  monedaSeleccionada: string;
  // contiene el usuario login
  usuario: User;

  precioBitcoin: string;
  precioEthereum: string;
  precioLitecoin: string;

  fechaBitcoin: Date;
  fechaEthereum: Date;
  fechaLitecoin: Date;

  Highcharts: typeof Highcharts = Highcharts;
  graficaBitcoin: Highcharts.Options;
  graficaLitecoin: Highcharts.Options;
  graficaEthereum: Highcharts.Options;
  paginaWebs = [
    { name: 'Bitstamp' },
    { name: 'Coinmarketcap' },
    { name: 'Coinmonitor' },
  ];
  monederos = [
    {name: 'Dolar'},
    {name: 'Peso'},
    {name: 'Criptomoneda'},
  ];

  // Para cargar todo los cliente
  clientes: Cliente[] = [];
  // Para cargar todo los proveedores
  proveedores: Proveedor[] = [];

  // Formulario
  formularioCriptomoneda = this.fb.group({
    paginaWeb: [null],
    cliente: [null],
    moneda: [null],
    proveedor: [null],
    comision_p: [null],
    cliente_compra: [null],
    comision_v: [null],
    criptomoneda: [null],
    cotizacion_dolar: [],
  });

  constructor(
    private bitstampService: BitstampService,
    private clienteService: ClienteService,
    private proveService: ProveService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.usuario = this.authService.currentUserValue;
    // obtengo todo los cliente para selector
    this.clienteService.getCliente().subscribe(
      clientes => {
        this.clientes = clientes;
      }
    );
    // obtengo todo los proveedores para el selector
    this.proveService.getProve().subscribe(
      proveedores => {
        this.proveedores  = proveedores;
      }
    );
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
    this.graficaLitecoin = this.graficaBitcoin;
    this.graficaEthereum = this.graficaBitcoin;
  }

  ngOnInit(): void {
  }

  getWeb(webSeleccionada) {
    console.log(webSeleccionada);
    // obtengo para la web seleccionada..
    if (webSeleccionada === 'Bitstamp') {
      this.obtenerBitcoins();
      this.obtenerEthereum();
      this.obtenerLitecoin();
    }
  }

  obtenerBitcoins() {
    this.bitstampService.getBitcoinTransactions().subscribe(
      monedas => {
        const transactionBitstamp = monedas;
        // tslint:disable-next-line: no-string-literal
        this.precioBitcoin = monedas[0]['price'];
        this.fechaBitcoin = new Date(); // midata[0]['date'];
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
        this.fechaEthereum = new Date(); // midata[0]['date'];
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
        this.fechaLitecoin = new Date(); // midata[0]['date'];
        const precio = transactionLitecoin.map(x => parseFloat(x.price));
        // tslint:disable-next-line: no-string-literal
        this.graficaLitecoin.series[0]['data'] = precio.reverse();
        // this.graficaBitcoin.xAxis['categories'] = fecha;
        Highcharts.chart('graficaLitecoin', this.graficaLitecoin);
      }
    );
  }

  criptomonedaSeleccionada(criptomoneda, tipo) {
    this.tipoCripto = tipo;
    // seteo el valor de criptomoneda...para ingresar el valor en el input de criptomoneda
    this.formularioCriptomoneda.controls.criptomoneda.setValue(criptomoneda);
  }

  seleccionProveedor(proveedor) {
    this.proveedorSeleccionado = proveedor;
    // seteo el valor de proveedor para mostrar en detalle
    this.formularioCriptomoneda.controls.proveedor.setValue(proveedor.id);
  }
  seleccionCliente(cliente) {
    // seteo el valor del cliente para mostrar en detalle
    this.formularioCriptomoneda.controls.cliente.setValue(cliente);
  }

  onSubmit() {
    console.log(this.formularioCriptomoneda.value);

  }
  presupuesto(formulario) {
    // bandera para el formulario
    this.formularioDevuelto = true;
    this.monedaSeleccionada = formulario.moneda;
    console.log(formulario);
    // tslint:disable-next-line: variable-name
    const comision_p = parseFloat(formulario.comision_p) ;
    // tslint:disable-next-line: variable-name
    const cotizacion_cripto = parseFloat(formulario.criptomoneda) ;
    // tslint:disable-next-line: variable-name
    const comision_v = parseFloat(formulario.comision_v) ;
    // tslint:disable-next-line: variable-name
    const cotizacion_dolar = parseFloat(formulario.cotizacion_dolar) ;
    // tslint:disable-next-line: variable-name
    const cliente_compra = parseFloat(formulario.cliente_compra) ;
    // hago los calculos para proveedor y el vendedor..
    this.calcularProveedor( comision_p, comision_v, cotizacion_cripto, cotizacion_dolar, cliente_compra, formulario.moneda);
  }

  // tslint:disable-next-line: variable-name
  calcularProveedor( comision_p, comision_v, cotizacion_cripto, cotizacion_dolar, cliente_compra, moneda) {
    console.log(moneda);
    // calc_com_prov = { prove: 0, vende: 0 };
    this.calc_com_prov.prove = (comision_p * cotizacion_cripto) / 100;
    this.calc_com_prov.vende = (comision_v * cotizacion_cripto) / 100;
    console.log((comision_p * cotizacion_cripto) / 100);
    console.log((comision_v * cotizacion_cripto) / 100);

    this.costo_dolar.prove  = this.calc_com_prov.prove + cotizacion_cripto;
    this.costo_dolar.vende  = this.calc_com_prov.vende + cotizacion_cripto;
    console.log(this.calc_com_prov.prove + cotizacion_cripto);
    console.log(this.calc_com_prov.vende + cotizacion_cripto);

    if (moneda === 'Dolar') {
      this.costo_total.prove = cliente_compra / this.costo_dolar.prove ;
      this.costo_total.vende = cliente_compra / this.costo_dolar.vende ;
      console.log(cliente_compra / this.costo_dolar.prove );
      console.log(cliente_compra / this.costo_dolar.vende );

      this.costo_peso.prove = cliente_compra * cotizacion_dolar;
      this.costo_peso.vende = cliente_compra * cotizacion_dolar;
      console.log(cliente_compra * cotizacion_dolar);
    }

    if (moneda === 'Peso') {
      this.costo_peso.prove = this.costo_dolar.prove  * cotizacion_dolar;
      this.costo_peso.vende = this.costo_dolar.vende  * cotizacion_dolar;
      console.log(this.costo_dolar.prove * cotizacion_dolar);
      console.log(this.costo_dolar.vende * cotizacion_dolar);

      this.costo_total.prove = cliente_compra / this.costo_peso.prove ;
      this.costo_total.vende = cliente_compra / this.costo_peso.vende ;
      console.log(cliente_compra / this.costo_peso.prove );
      console.log(cliente_compra / this.costo_peso.vende );
    }

    if ( moneda === 'Criptomoneda') {
      this.costo_total.prove = this.costo_dolar.prove * cliente_compra;
      this.costo_total.vende = this.costo_dolar.vende * cliente_compra;
      console.log(this.costo_dolar.prove * cliente_compra);
      console.log(this.costo_dolar.vende * cliente_compra);

      this.costo_peso.prove = this.costo_total.prove * cotizacion_dolar;
      this.costo_peso.vende = this.costo_total.vende * cotizacion_dolar;
      console.log(this.costo_total.prove * cotizacion_dolar);
      console.log(this.costo_total.vende * cotizacion_dolar);
      }

  }

}
