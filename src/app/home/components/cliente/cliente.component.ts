import { Component, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  columnsToDisplay = [ 'dni', 'apellido', 'nombre',  'telefono', 'email'];
  mostrarCancelar = true;
  mostrarEdit = false;
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
  disabledEnable() {
    // this.formCliente.controls.dni.enable();
    this.formDisabled = !this.formDisabled;
    const state = this.formDisabled ? 'disable' : 'enable';
    Object.keys(this.formCliente.controls).forEach((controlName) => {
      this.formCliente.controls[controlName][state](); // disables/enables each form control based on 'this.formDisabled'
    });
  }

  editarCliente() {
    this.disabledEnable();
    if (this.mostrarCancelar) {
      this.buttonEditar = 'Guardar';
      // boton true:oculta , false: muestra
      this.mostrarCancelar = false;
    } else {
      this.buttonEditar = 'Editar';
      this.mostrarCancelar = true;
      // realizo la edicion
      console.log('editar provee', this.formCliente.value);
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

  cancelarEdicionCliente() {
    this.mostrarEdit = false;
    this.mostrarCancelar = true;
    this.buttonEditar = 'Editar';
    this.buttonNuevo = 'Nuevo';
    this.disabledEnable();
  }

  seleccionFila(fila) {
    // pregunto si estoy editando no puedo seleccionar los datos..
    if (this.mostrarCancelar) {
      this.mostrarCancelar = true;
      Object.keys(this.formCliente.controls).forEach((controlName) => {
        // recorro todo los elementos del formulario y los seteo
        this.formCliente.controls[controlName].setValue(fila[controlName]);
      });
    }
  }

  nuevoCliente() {
    if (this.buttonNuevo === 'Guardar') {
      this.mostrarEdit = false;
      this.mostrarCancelar = true;
      console.log(this.formCliente.value);
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
      this.mostrarCancelar = false;
      this.mostrarEdit = true;
      this.resetFormCliente();
    }
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
