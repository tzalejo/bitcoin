import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteService } from '@core/services/cliente/cliente.service';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  // Para trabajar con el input dni y hacer focus desde el componente
  @ViewChild('dni') elementoDni: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  columnsToDisplay = [ 'dni', 'apellido', 'nombre',  'telefono', 'email'];
  mostrarCancelar = false; // Para habilitar/deshabilitar el cancer
  mostrarEdit = false; // Para habilitar/deshabilitar el editar
  mostrarNuevo = true; // Para habilitar/deshabilitar el nuevo
  buttonEditar = 'Editar';
  buttonNuevo = 'Nuevo';
  dataSource = new MatTableDataSource();
  // Variable/Flag declare
  formDisabled = true;
  formCliente = this.fb.group(
    {
      id: [{value: '', disabled: this.formDisabled}],
      apellido: [{value: '', disabled: this.formDisabled}],
      nombre: [{value: '', disabled: this.formDisabled}],
      dni: [{value: '', disabled: this.formDisabled}],
      email: [{value: '', disabled: this.formDisabled}],
      telefono: [{value: '', disabled: this.formDisabled}]
    }
  );
  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder
  ) {
    this.actualizarClientes();
  }

  ngOnInit(): void {
  }

  actualizarClientes() {
    this.clienteService
      .getClientes()
      .subscribe(clientes => {
        this.dataSource.data = clientes;
        this.dataSource.paginator = this.paginator;
      });

  }
  // cambio el estado enable/disable de los input
  disabledEnable() {
    // this.formCliente.controls.dni.enable();
    this.formDisabled = !this.formDisabled;
    const state = this.formDisabled ? 'disable' : 'enable';
    Object.keys(this.formCliente.controls).forEach((controlName) => {
      this.formCliente.controls[controlName][state](); // disables/enables each form control based on 'this.formDisabled'
    });
  }

  editarCliente() {
    // habilito los input
    this.disabledEnable();
    // Si no estoy mostrando el boton cancelar, es porque clicke en edit
    // caso contrario es por que estoy guardando, por ello llamo al servicio
    if (!this.mostrarCancelar) {
      // Hago focus en el dni
      setTimeout(() => {
        this.elementoDni.nativeElement.focus();
      }, 0);
      // cambia el editar por guardar
      this.buttonEditar = 'Guardar';
      // boton cancelar el estado es true:muestra , false: oculta
      this.mostrarCancelar = true;
      // deshabilito el boton nuevo
      this.mostrarNuevo = false;
    } else {
      this.buttonEditar = 'Editar';
      this.mostrarNuevo = true;
      this.mostrarCancelar = false;
      // realizo la edicion
      // console.log('editar provee', this.formCliente.value);
      this.clienteService
          .modificarCliente(this.formCliente.value)
          .subscribe(data => {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Cliente modificado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.actualizarClientes();
          });
    }
  }

  // Si estoy editando o nuevo, cancelo todo.
  cancelarEdicionCliente() {
    // habilito el boton nuevo
    this.mostrarNuevo = true;
    this.mostrarEdit = false;
    // no muestro el cancelar
    this.mostrarCancelar = false;
    // pongo el buton en estado inicial, osea edit
    this.buttonEditar = 'Editar';
    this.buttonNuevo = 'Nuevo';
    // cambio los estado de los input
    this.disabledEnable();
  }

  seleccionFila(fila) {
    // pregunto si estoy editando o creando un nuevo cliente no puedo seleccionar los datos..
    if (!this.mostrarCancelar) {
      // habilito el editar
      this.mostrarEdit = true;
      this.mostrarCancelar = false;
      Object.keys(this.formCliente.controls).forEach((controlName) => {
        // recorro todo los elementos del formulario y los seteo
        this.formCliente.controls[controlName].setValue(fila[controlName]);
      });
    }
  }

  nuevoCliente() {
    // si el boton es guardar, guardo el nuevo cliente
    if (this.buttonNuevo === 'Guardar') {
      // this.mostrarEdit = true;
      // this.mostrarCancelar = false;
      // console.log(this.formCliente.value);
      this.clienteService
        .crearCliente(this.formCliente.value)
        .subscribe(data => {
          // console.log(data);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Se creo correctamente el Cliente.',
            showConfirmButton: false,
            timer: 1500
          });
          this.actualizarClientes();
        });
    } else {
      // Para hacer un focus al input dni
      // this will make the execution after the above boolean has changed???
      // Esto hará la ejecución después de que el booleano anterior haya cambiado
      setTimeout(() => {
        this.elementoDni.nativeElement.focus();
      }, 0);
      // this.mostrarCancelar = true;
      this.mostrarEdit = false;
      // Borro todo el contenido de los input
      this.resetFormCliente();
    }
    // Cambio su valor al opuesto..
    this.mostrarCancelar = !this.mostrarCancelar;
    // this.mostrarEdit = !this.mostrarEdit;

    this.disabledEnable();
    this.buttonNuevo = this.buttonNuevo === 'Nuevo' ? 'Guardar' : 'Nuevo';
  }

  resetFormCliente() {
    Object.keys(this.formCliente.controls).forEach((controlName) => {
      // recorro todo los elementos del formulario y los seteo
      this.formCliente.controls[controlName].setValue(null);
    });
  }

}
