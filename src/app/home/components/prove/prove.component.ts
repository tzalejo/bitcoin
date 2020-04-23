import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ProveService } from '@core/services/prove/prove.service';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-prove',
  templateUrl: './prove.component.html',
  styleUrls: ['./prove.component.css']
})
export class ProveComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  columnsToDisplay = [ 'dni', 'apellido', 'nombre',  'telefono', 'email'];
  mostrarCancelar = true;
  mostrarEdit = false;
  buttonEditar = 'Editar';
  buttonNuevo = 'Nuevo';
  dataSource = new MatTableDataSource();
  // Variable/Flag declare
  formDisabled = true;
  formProveedor = this.fb.group(
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
    private proveedorService: ProveService,
    private fb: FormBuilder
  ) {
    this.actualizarProveedores();
  }

  ngOnInit(): void {}

  actualizarProveedores() {
    this.proveedorService
      .getProveedores()
      .subscribe(proveedores => {
        this.dataSource.data = proveedores;
        this.dataSource.paginator = this.paginator;
      });

  }
  disabledEnable() {
    // this.formProveedor.controls.dni.enable();
    this.formDisabled = !this.formDisabled;
    const state = this.formDisabled ? 'disable' : 'enable';
    Object.keys(this.formProveedor.controls).forEach((controlName) => {
      this.formProveedor.controls[controlName][state](); // disables/enables each form control based on 'this.formDisabled'
    });
  }

  editarProveedor() {
    this.disabledEnable();
    if (this.mostrarCancelar) {
      this.buttonEditar = 'Guardar';
      // boton true:oculta , false: muestra
      this.mostrarCancelar = false;
    } else {
      this.buttonEditar = 'Editar';
      this.mostrarCancelar = true;
      // realizo la edicion
      this.proveedorService
          .modificarProveedor(this.formProveedor.value)
          .subscribe(data => {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Proveedor modificado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.actualizarProveedores();
          });
    }
  }

  cancelarEdicionProve() {
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
      Object.keys(this.formProveedor.controls).forEach((controlName) => {
        // recorro todo los elementos del formulario y los seteo
        this.formProveedor.controls[controlName].setValue(fila[controlName]);
      });
    }
  }

  nuevoProveedor() {
    if (this.buttonNuevo === 'Guardar') {
      this.mostrarEdit = false;
      this.mostrarCancelar = true;
      console.log(this.formProveedor.value);
      this.proveedorService
        .crearProveedor(this.formProveedor.value)
        .subscribe(data => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Proveedor modificado correctamente.',
            showConfirmButton: false,
            timer: 1500
          });
          this.actualizarProveedores();
        });
    } else {
      this.mostrarCancelar = false;
      this.mostrarEdit = true;
      this.resetFormProveedor();
    }
    this.disabledEnable();
    this.buttonNuevo = this.buttonNuevo === 'Nuevo' ? 'Guardar' : 'Nuevo';
  }

  resetFormProveedor() {
    Object.keys(this.formProveedor.controls).forEach((controlName) => {
      // recorro todo los elementos del formulario y los seteo
      this.formProveedor.controls[controlName].setValue(null);
    });

    console.log(this.formProveedor);
  }
}
