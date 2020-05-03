
import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Cliente } from '@core/interface/cliente';
import { ClienteService } from '@core/services/cliente/cliente.service';
@Component({
  selector: 'app-seleccion-cliente',
  templateUrl: './seleccion-cliente.component.html',
  styleUrls: ['./seleccion-cliente.component.css']
})
export class SeleccionClienteComponent implements OnInit {
  @ViewChild('inputCliente') elementoInput: ElementRef;
  @Input() cliente: Cliente; // viene desde home..cliente seleccionado de la tabla
  @Output() clienteSeleccionado: EventEmitter<number> = new EventEmitter(); // envio el cliente buscado

  clientes: Cliente[] = [];
  myControl = new FormControl();
  filtroCliente: Observable<Cliente[]>;

  constructor(
    private renderer: Renderer2,
    private clienteService: ClienteService,
  ) {
    // obtengo todo los clientes
    this.clienteService.getClientes().subscribe(clientes => {
      this.clientes = clientes;
    });
  }

  ngOnInit() {
    // obtengo todo los cliente para selector
    this.filtroCliente = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : `${value.nombre} `),
      map(value => this._filter(value)),
    );
  }

  /**
   * Para resetear el input desde el componente padre(home.component)
   */
  @Input()
  set resetInput(value) {
    // Hago esta if porque al inicio me tira undefined el elmentoinput..
    if (typeof this.elementoInput !== 'undefined') {
      // llamao al componente html  input y seteo el value en vacio.
      this.renderer.setProperty(this.elementoInput.nativeElement , 'value', value);
    }
  }
  displayFn(cliente: Cliente): string {
    // retorno el cliente para mostrar en el input
    if (cliente && cliente.apellido ) {
      return `${cliente.apellido} ${cliente.nombre}`;
    }
    return '';
  }

  // accion para enviar el cliente buscado, al formulario home.
  enviarCliente(event) {
    this.clienteSeleccionado.emit(event.option.value.id);
  }
  private _filter(value: string ): Cliente[] {
    const filterValue = value.toLowerCase();
    // console.log(filterValue);
    return this.clientes.filter(cliente => cliente.apellido.toLowerCase().indexOf(filterValue) === 0 );
  }
}
