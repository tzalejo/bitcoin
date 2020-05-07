import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
    // pregunto si estoy editando no puedo seleccionar los datos..
    if (!this.mostrarCancelar) {
      // habilito el editar
      this.mostrarEdit = true;
      this.mostrarCancelar = false;
      Object.keys(this.formProveedor.controls).forEach((controlName) => {
        // recorro todo los elementos del formulario y los seteo
        this.formProveedor.controls[controlName].setValue(fila[controlName]);
      });
    }
  }

  nuevoProveedor() {
    if (this.buttonNuevo === 'Guardar') {
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
      // Para hacer un focus al input dni
      // this will make the execution after the above boolean has changed???
      // Esto hará la ejecución después de que el booleano anterior haya cambiado
      setTimeout(() => {
        this.elementoDni.nativeElement.focus();
      }, 0);
      // this.mostrarCancelar = true;
      this.mostrarEdit = false;
      this.resetFormProveedor();
    }
    // Cambio su valor al opuesto..
    this.mostrarCancelar = !this.mostrarCancelar;
    this.disabledEnable();
    this.buttonNuevo = this.buttonNuevo === 'Nuevo' ? 'Guardar' : 'Nuevo';
  }

  resetFormProveedor() {
    Object.keys(this.formProveedor.controls).forEach((controlName) => {
      // recorro todo los elementos del formulario y los seteo
      this.formProveedor.controls[controlName].setValue(null);
    });
  }
}
