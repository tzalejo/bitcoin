import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormularioService } from '@core/services/formulario/formulario.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ClienteService } from '@core/services/cliente/cliente.service';
import { Cliente } from '@core/interface/cliente';

import { PdfMakeWrapper, Txt, Table, Cell } from 'pdfmake-wrapper';
import Swal from 'sweetalert2';
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
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FiltrosComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filtroActivo: boolean;
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
    { criptomoneda: 'Bitcoin' },
    { criptomoneda: 'Ethereum' },
    { criptomoneda: 'Litecoin' },
  ];
  fechaDesde: string;
  fechaHasta: string;
  clientes: Cliente[];
  filterValues = {};
  /* fin tabla */
  constructor(
    private formularioService: FormularioService,
    private clienteService: ClienteService,
    // private pdfService: PdfService
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
    this.filtrar();
  }

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
          // console.log(this.dataSource.data);
          // console.log(this.getGananciaEuro());
          // console.log(this.getGananciaDolar());
          // console.log(this.getGananciaPeso());
        }
      );
  }
  resetFilter() {
    this.filterValues = {};
    this.filtroActivo = false;
  }

  filterChange(name, event) {
    this.filterValues[name] = event;
    // console.log(this.filterValues);
  }

  getGananciaEuro() {
    // this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.criptomoneda);
    // return (this.getGananciaCripto() * this.dataSource.);
    return this.dataSource.data
      .map(t => (t['compra_moneda'] === 'Euro' ? parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['criptomoneda']) : 0))
      .reduce((acc, value) => acc + value, 0);
  }

  getGananciaDolar() {
    // this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.criptomoneda);
    return this.dataSource.data
      .map(t => (t['compra_moneda'] === 'Dolar' ? parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['criptomoneda']) :
        parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['costo_criptomoneda_p'])))
      .reduce((acc, value) => acc + value, 0);
  }
  getGananciaPeso() {
    // this.gananciaDolar = (this.gananciaCriptomoneda * this.formCriptomoneda.value.costo_criptomoneda_p);
    return this.dataSource.data
      .map(t => (t['compra_moneda'] === 'Peso' ?
        parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['costo_criptomoneda_p']) * parseFloat(t['dolar']) :
        parseFloat(t['ganacia_criptomoneda']) * parseFloat(t['criptomoneda']) * parseFloat(t['dolar'])))
      .reduce((acc, value) => acc + value, 0);
  }

  getGananciaCripto() {
    // tslint:disable-next-line: no-string-literal
    return this.dataSource.data.map(t => parseFloat(t['ganacia_criptomoneda'])).reduce((acc, value) => acc + value, 0);
  }
  generarpdf() {
    if (this.dataSource.data.length === 0) {
      // para cuando no haya datos y asi no generar error..
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Error Filtro',
        showConfirmButton: true,
        text: 'Debe realizar un filtro de los datos.',
        // timer: 3500,
      });
      return false;
    }
    const pdf = new PdfMakeWrapper();

    pdf.pageSize('A4');
    pdf.pageMargins([20, 60, 20, 60]);
    pdf.pageOrientation('portrait');

    const fecha = new Date();
    pdf.add(
      // tslint:disable-next-line: no-unused-expression
      new Txt(`Fecha: ${fecha.toLocaleDateString()}`).alignment('right').fontSize(10).end
    );
    pdf.add(
      new Txt('INGENIERIA DE SISTEMA').fontSize(18).alignment('center').decorationStyle('double').margin([0, 0, 0, 20]).end
    );
    pdf.add(
      new Txt('RESUMEN').fontSize(12).margin([0, 0, 0, 20]).end
    );

    pdf.add(
      new Txt(`Criptomoneda:  ${this.filterValues['tipo_criptomoneda']}`).end
    );
    pdf.add(
      new Txt((this.filterValues['compra_moneda'] ? 'Moneda: ' + this.filterValues['compra_moneda'] : '') ).end
    );
    pdf.add(
      new Txt((this.filterValues['fechaDesde'] ? 'Fecha Desde: ' + this.filterValues['fechaDesde'] : '') ).end
    );
    pdf.add(
      new Txt((this.filterValues['fechaHasta'] ? 'Fehca Hasta: ' + this.filterValues['fechaHasta'] : '')).end
    );
    pdf.add(
      new Txt((this.filterValues['cliente'] ? 'Cliente: ' + this.filterValues['cliente'] : '')).end
    );
    pdf.add(
      new Txt('Estado: ' + (this.filterValues['estado'] === 'v' ? 'Venta' : 'Presupuesto')).end
    );
    pdf.add(
      new Txt('').margin([0, 0, 0, 20]).end
    );
    pdf.add(
      new Table([
        [
          new Txt('FECHA').bold().end,
          new Txt('IMPORTE').bold().end,
          new Txt('COTIZACION').bold().end,
          new Txt('PROVEEDOR').bold().end,
          new Txt('VENDEDOR').bold().end,
          new Txt('DOLAR').bold().end,
          new Txt('EURO').bold().end,
          new Txt('PESO').bold().end,
          new Txt('CRIPTOMONEDA').bold().end,
        ]
      ]).fontSize(8).widths([50, 50, 50, 55, 55, 50, 50, 50, 75]).end,
    );
    pdf.add(
      new Table(this.getFila()).fontSize(8).widths([50, 50, 50, 55, 55, 50, 50, 50, 75]).margin([0, 0, 0, 20]).end
    );

    pdf.add(
      new Txt(`Total Dolar: US$ ${this.getGananciaDolar().toFixed(2)}`).end
    );
    pdf.add(
      new Txt(`Total Euro: € ${this.getGananciaEuro().toFixed(2)}`).end
    );
    pdf.add(
      new Txt(`Total Peso: $ ${this.getGananciaPeso().toFixed(2)}`).end
    );
    pdf.add(
      new Txt(`Total Criptomoneda:  ${this.getGananciaCripto()}`).end
    );
    pdf.create().open();
  }
  getFila() {
    const fila = [];
    this.dataSource.data.map(f => {
      let dolar = 0;
      if (f['compra_moneda'] === 'Dolar') {
        dolar = f['ganacia_criptomoneda'] * f['criptomoneda'];
      }
      if (f['compra_moneda'] === 'Peso') {
        dolar = f['ganacia_criptomoneda'] * f['costo_criptomoneda_p'];
      }

      let euro = 0;
      if (f['compra_moneda'] === 'Euro') {
        euro = f['ganacia_criptomoneda'] * f['criptomoneda'];
      }

      let peso = 0;
      if (f['compra_moneda'] === 'Peso') {
        peso = parseFloat(f['ganacia_criptomoneda']) * parseFloat(f['costo_criptomoneda_p']) * parseFloat(f['dolar']);
      }
      if (f['compra_moneda'] !== 'Peso') {
        peso = f['ganacia_criptomoneda'] * f['criptomoneda'] * f['dolar'];
      }
      fila.push([
        f['fecha'],
        f['importe_compra'],
        f['criptomoneda'],
        f['costo_criptomoneda_p'],
        f['costo_criptomoneda_v'],
        dolar.toFixed(2),
        euro.toFixed(2),
        peso.toFixed(2),
        f['ganacia_criptomoneda']
      ]);
    });
    return fila;
  }
}
