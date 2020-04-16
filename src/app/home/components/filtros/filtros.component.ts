import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormularioService } from '@core/services/formulario/formulario.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ClienteService } from '@core/services/cliente/cliente.service';
import { Cliente } from '@core/interface/cliente';

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
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FiltrosComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filtroActivo: boolean;
  constructor(
    private formularioService: FormularioService,
    private clienteService: ClienteService
  ) {

    // seteo mi filtro por defecto
    this.filterValues['tipo_criptomoneda'] = 'Bitcoin';
    this.filterValues['estado'] = 'v';
    // traigo todo los formulario
    this.formularioService.getFormularios()
      .subscribe(
        formulario => {
          this.dataSource.data = formulario;
          this.dataSource.paginator = this.paginator;
          this.filtroActivo = false;
        }
      );
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  dataSource = new MatTableDataSource();
  columnsToDisplay = [
    'fecha', 'importe', 'criptomoneda', 'valor_comision_prove',
    'valor_comision_vendedor', 'g_dolar', 'g_euro', 'g_peso', 'g_criptomoneda'];
  expandedElement: TablaFormulario | null;
  compraMonedas = [
    { compra_moneda: 'Dolar' },
    { compra_moneda: 'Euro' },
    { compra_moneda: 'Peso' },
  ];
  estados = [
    { estado: 'v', descripcion: 'Venta' },
    { estado: 'p', descripcion: 'Presupuesto' },
  ];
  criptos = [
    { criptomoneda: 'Bitcoin'},
    { criptomoneda: 'Ethereum'},
    { criptomoneda: 'Litecoin'},
  ];
  fechaDesde: string;
  fechaHasta: string;
  clientes: Cliente[];
  filterValues = {};
  /* fin tabla */

  ngOnInit() {
    // para no mostrar al inicio los totales
    this.filtroActivo = false;
    this.clienteService.getClientes().subscribe(
      clientes => {
        this.clientes = clientes;
      }
    );
  }

  filtrar() {
    this.formularioService.getFormulariosFilter(this.filterValues)
      .subscribe(
        data => {
          // para que muestro los totales
          this.filtroActivo = true;
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          console.log(this.dataSource.data);
          console.log(this.getGananciaEuro());
          console.log(this.getGananciaDolar());
          console.log(this.getGananciaPeso());
        }
      );
  }
  resetFilter() {
    this.filterValues = {};
    this.filtroActivo = false;
  }

  filterChange(name, event) {
    this.filterValues[name] = event;
    console.log(this.filterValues);
  }

  getGananciaEuro() {
    // this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.criptomoneda);
    // return (this.getGananciaCripto() * this.dataSource.);
    return this.dataSource.data
            .map(t => (t['compra_moneda'] === 'Euro' ? parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['criptomoneda']) : 0 ))
            .reduce((acc, value) => acc + value, 0);
  }

  getGananciaDolar() {
    // this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.criptomoneda);
    return this.dataSource.data
    .map(t => (t['compra_moneda'] === 'Dolar' ? parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['criptomoneda']) :
                parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['costo_criptomoneda_p']) ))
            .reduce((acc, value) => acc + value, 0);
  }
  getGananciaPeso() {
    // this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.costo_criptomoneda_p);
    return this.dataSource.data
    .map(t => (t['compra_moneda'] === 'Peso' ?
                parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['costo_criptomoneda_p']) * parseFloat(t['dolar']) :
                parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['criptomoneda']) * parseFloat(t['dolar']) ))
            .reduce((acc, value) => acc + value, 0);
  }

  getGananciaCripto() {
    // tslint:disable-next-line: no-string-literal
    return this.dataSource.data.map(t => parseFloat(t['ganacia_criptomoneda'])).reduce((acc, value) => acc + value, 0);
  }
}
