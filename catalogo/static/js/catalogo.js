//Variables para controlar las celdas editables o eliminables
var editableCellsDisco = true;
var editableCellsPastilla = true;
var deletedRowDisco = true;
var deletedRowPastilla = true;
var checkUpdateImage = true;

//Función para obtener el token csrf generado por django
function getCSRFToken() {
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    return csrfToken;
}
//Función para habilitar o deshabilitar un botón
function disableButtonSave(val, id) {
    var btnGuardar = document.getElementById(id);
    btnGuardar.disabled = val;
    if (val === true) {
        btnGuardar.style.opacity = "0.5";
        btnGuardar.style.cursor = "not-allowed";
    } else if (val === false) {
        btnGuardar.style.opacity = "";
        btnGuardar.style.cursor = "";
    }
}
// Función para agregar una fila a la tabla de discos
function addRowDisco() {
     // Reiniciar la variable de control
    deletedRowDisco = false;
    // Buscar la tabla de discos por id
    var table = Tabulator.prototype.findTable("#tabla_discos")[0];
    // Obtener la última fila de la tabla
    var lastRow = table.getData().pop();
    // Calcular el ID próximo de la fila
    var newId = lastRow ? lastRow.id + 1 : 1;
    // Mostrar un cuadro de diálogo para seleccionar el tipo de disco
    Swal.fire({
        title: '<h5>Seleccione el tipo</h5>',
        input: 'select',
        inputOptions: {
            'HIPER VENTILADO': 'HIPER VENTILADO',
            'VENTILADO': 'VENTILADO',
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        width: "350px",
        inputValidator: function (value) {
            return new Promise(function (resolve, reject) {
                if (value !== '') {
                    resolve();
                }
            });
        }
    }).then(function (result) {// Manejar la acción después de que el usuario confirme o cancele
        if (result.isConfirmed) {
             // Deshabilitar el botón de guardar
            disableButtonSave(true, "btnGuardarDisco");
            // Crear los datos de la nueva fila
            var rowData = {
                id: newId,
                codigo: "",
                tipo: result.value,
                aplicacion: "",
                codigoPastilla: "",
                lado: "",
                pvp: "0.00"
            };
            // Marcar las celdas como no editables y deshabilitar las filas
            editableCellsDisco = false;
            table.getRows().forEach(function (row) {
                row.getElement().classList.add("disabled-row");
            });
            // Agregar la nueva fila a la tabla
            table.addRow(rowData, true).then(function (row) {
                 // Obtener la celda de eliminación
                var deleteCell = row.getCell("eliminar");
                // Agregar un botón de guardar alado de la celda de eliminación
                deleteCell.getElement().innerHTML += "&nbsp;&nbsp;<i class='bx bx-save' title='Guardar'></i>";
                // Escuchar el clic en el botón de guardar
                deleteCell.getElement().querySelector("i.bx-save").addEventListener("click", function () {
                    // Validar el código del disco, y el precio requeridos
                    if (!row.getData().codigo) {
                        validateInputTable("El código del disco es requerido");
                    } else if (!row.getData().pvp || Number(row.getData().pvp) === 0) {
                        validateInputTable("El precio del disco es requerido");
                    } else {
                        // Agregar la fila al JSON y enviar los datos al servidor
                        addRowJson(row.getData(), "discos", "btnGuardarDisco");
                    }
                });
            });
        }
    });
}
//Función para mostrar una alerta personalizada con un mensaje
function validateInputTable(msg) {
    Swal.fire({
        html: "<h4>" + msg + "</h4>",
        icon: "info",
        width: "300px",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6"
    });
}
//Función para actualizar la foto de la tabla pastillas
function updateFoto(selectedFile, prevUrlImage, id) {
    var formData = new FormData();
    success = false;
    formData.append('archivo', selectedFile);
    formData.append('prevurl', prevUrlImage);
    formData.append('id', id);

    const requestOptions = {
        method: 'POST',
        headers: { 'X-CSRFToken': getCSRFToken() },
        body: formData
    };

    fetch('/update_image/', requestOptions)
        .then(res => {
            if (res.ok) {
                loadJsonData("pastillas", true);
                success = true;
            }
            return res.text()
        })
        .then(message => {
            setMessage("msg-pastilla", message, success)
        })
}
//Función para ocultar el icono de mostrar imagen y establecer el mensaje personalizado
function hideElementCellFoto(fotoCell, label) {
    fotoCell.getElement().querySelector('.bx-search').style.display = "none";
    label.textContent = "Seleccionar";
    label.style.marginRight = "10px";
}
//Función para crear el label predeterminado antes de cargar la foto
function createLabelFotoRegister() {
    var lblImage = document.querySelector('.input-group .imglabel');
    var paragraph = document.createElement('p');
    paragraph.style.fontSize = '11px';
    paragraph.textContent = 'Ninguna foto';
    lblImage.insertAdjacentElement('afterend', paragraph);
}
//Función para cambiar el mensaje del label al cargar una foto
function setTextLabelFoto(msg) {
    var last_paragraph = document.querySelector('.input-group p');
    last_paragraph.textContent = msg;
}
// Función para agregar una fila a la tabla de pastillas
function addRowPastilla() {
    // Reiniciar las variables de control
    deletedRowPastilla = false;
    checkUpdateImage = false;
     // Buscar la tabla de pastillas
    var table = Tabulator.prototype.findTable("#tabla_pastillas")[0];
     // Obtener la última fila de la tabla
    var lastRow = table.getData().pop();
    // Calcular el nuevo ID próximo de la fila
    var newId = lastRow ? lastRow.id + 1 : 1;
    // Mostrar un cuadro de diálogo para seleccionar el tipo de pastilla
    Swal.fire({
        title: '<h5>Seleccione el tipo</h5>',
        input: 'select',
        inputOptions: {
            'CAJA ROJA': 'CAJA ROJA',
            'CAJA NEGRA': 'CAJA NEGRA',
            'MULLER METAL': 'MULLER METAL',
            'MULLER CERÁMICA': 'MULLER CERÁMICA'
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        width: "350px",
        inputValidator: function (value) {
            return new Promise(function (resolve, reject) {
                if (value !== '') {
                    resolve();
                }
            });
        }
    }).then(function (result) {// Manejar la acción después de que el usuario confirme o cancele
        if (result.isConfirmed) {
            //Deshabilitar el botón de guardado
            disableButtonSave(true, "btnGuardarPastilla");
            // Crear los datos de la nueva fila
            var rowData = {
                id: newId,
                codigo: "",
                tipo: result.value,
                aplicacion: "",
                fotoReferencial: "",
                ancho: "0 mm",
                altura: "0 mm",
                grosor: "0 mm",
                pvp: "0.00"
            };
            // Marcar las celdas como no editables y deshabilitar las filas
            editableCellsPastilla = false;
            table.getRows().forEach(function (row) {
                row.getElement().classList.add("disabled-row");
            });
            // Agregar la nueva fila a la tabla
            table.addRow(rowData, true).then(function (row) {
                 // Obtener la celda de eliminación y la celda de la foto
                var deleteCell = row.getCell("eliminar");
                var fotoCell = row.getCell("fotoReferencial");
                var lastFileInput = document.querySelector('.fileInput');
                var label = lastFileInput.parentElement.querySelector('label');
                 // Ocultar la celda de la foto y crear una nueva etiqueta para la foto
                hideElementCellFoto(fotoCell, label);
                createLabelFotoRegister();
                // Escuchar cambios en la selección de archivos para la foto
                lastFileInput.addEventListener('change', function (event) {
                    var selectedFile = event.target.files[0];
                    if (selectedFile) {
                        //Validar el tamaño de la imagen
                        if (validateSizeImage(selectedFile) === true) {
                            event.target.value = '';  // Limpiar el valor del input
                            return;
                        } else {
                            // Establecer texto para la etiqueta de la foto
                            setTextLabelFoto("Foto seleccionada");
                            var reader = new FileReader();
                            //Establecer la imagen como base64
                            reader.onload = function (event) {
                                var base64String = event.target.result;
                                row.getData().fotoReferencial = base64String;
                            };
                            reader.readAsDataURL(selectedFile);
                        }
                    }
                });

                 // Agregar un botón de guardar alado de la celda de eliminación
                deleteCell.getElement().innerHTML += "&nbsp;&nbsp;<i class='bx bx-save' title='Guardar'></i>";
                // Escuchar el clic en el botón de guardar
                deleteCell.getElement().querySelector("i.bx-save").addEventListener("click", function () {
                    // Validar el código, el precio de la pastilla requeridos
                    if (!row.getData().codigo) {
                        validateInputTable("El código de la pastilla es requerido");
                    } else if (!row.getData().pvp || Number(row.getData().pvp) === 0) {
                        validateInputTable("El precio de la pastilla es requerido");
                    } else {
                        // Agregar la fila al JSON y enviar los datos al servidor
                        addRowJson(row.getData(), "pastillas", "btnGuardarPastilla");
                    }
                });
            });
        }
    });
}
//Función para validar el tamaño de la imagen
function validateSizeImage(selectedFile) {
    var fileSize = selectedFile.size;
    var fileSizeInMB = fileSize / (1024 * 1024);
    if (fileSizeInMB > 5) {
        validateInputTable("La imagen no debe pesar más de 5 MB");
        return true;
    } else {
        return false;
    }
}
// Función para registrar los datos de la tabla discos o pastillas del json en el servidor
function addRowJson(objeto, tblName, idBtn) {
    delete objeto.eliminar; //Eliminar el objeto de eliminación generado al crear la tabla 
    success = false; //Marcar como petición erronea por defecto
    fetch('/add_data/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ objeto: objeto, tblName: tblName })
    }).then(res => {
        if (res.ok) {
            disableButtonSave(false, idBtn);//Habilitar el botón de guardado
            loadJsonData(tblName, true);//Recargar los datos en la tabla
            success = true; //Marcar como petición exitosa
        }
        return res.text()
    }).then(message => {
        if (tblName === "discos") {
            setMessage("msg-disco", message, success);
            editableCellsDisco = true; //Marcar la celda de tabla discos como editable
            deletedRowDisco = true;//Marcar la celda de tabla discos como eliminable
        } else if (tblName === "pastillas") {
            setMessage("msg-pastilla", message, success);
            editableCellsPastilla = true; //Marcar la celda de tabla pastillas como editable
            deletedRowPastilla = true; //Marcar la celda de tabla pastillas como eliminable
            checkUpdateImage = true; //Marcar la celda imagen de tabla pastillas como editable
        }
    })
}
// Función para actualizar los datos de la tabla discos o pastillas del json en el servidor
function updateRowJson(rowIndex, fieldName, newValue, tblName) {
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            rowIndex: rowIndex,
            fieldName: fieldName,
            newValue: newValue,
            tblName: tblName
        })
    };
    success = false;
    fetch("/update_data/", requestOptions)
        .then(res => {
            if (res.ok) {
                success = true;
            }
            return res.text()
        })
        .then(message => {
            if (tblName === "discos") {
                setMessage("msg-disco", message, success)
            } else if (tblName === "pastillas") {
                setMessage("msg-pastilla", message, success)
            }
        })
}
// Función para mostrar un mensaje personalizado
function setMessage(element, message, success) {
    var msgElement = document.querySelector("." + element);
    msgElement.textContent = message;
    if (success === false) {
        msgElement.style.backgroundColor = "#E71616";
    } else if (success === true) {
        msgElement.style.backgroundColor = "rgb(40, 153, 40)";
    }
    msgElement.style.display = "inline-block";
    msgElement.classList.add("message-animation");
    setTimeout(function () {
        msgElement.classList.remove("message-animation");
        msgElement.style.display = "none";
    }, 3000);
}

// Función para cargar datos en la tabla de discos utilizando Tabulator
function loadTabulatorDiscos(data) {
     // Buscar la tabla de discos utilizando su selector de ID
    var tableDiscos = Tabulator.prototype.findTable("#tabla_discos")[0];
    // Verificar si la tabla de discos ya existe para crearala, caso contrario actualizar sus datos
    if (!tableDiscos) {
        createTableDiscos(data.discos);
    } else {
        tableDiscos.setData(data.discos);
    }
}
// Función para cargar datos en la tabla de pastillas utilizando Tabulator
function loadTabulatorPastillas(data) {
     // Buscar la tabla de pastillas utilizando su selector de ID
    var tablePastillas = Tabulator.prototype.findTable("#tabla_pastillas")[0];
     // Verificar si la tabla de pastillas ya existe para crearala, caso contrario actualizar sus datos
    if (!tablePastillas) {
        createTablePastillas(data.pastillas);
    } else {
        tablePastillas.setData(data.pastillas);
    }
}

// Esta función carga los datos desde el servidor y los procesa según sea necesario
// tblName: Nombre de la tabla para cargar los datos (opcional)
// fetch_check: Booleano que indica si se debe usar fetch() para obtener los datos del servidor (opcional
function loadJsonData(tblName = undefined, fetch_check = false) {
    if (fetch_check === true) {
         // Configura las opciones para la solicitud fetch
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        };
        // Realiza la solicitud fetch para obtener los datos del servidor
        fetch("/", requestOptions)
            .then(response => response.text())
            .then(data => {
                data_parse = JSON.parse(data);
                // Según el nombre de la tabla, carga los datos en la tabla correspondiente
                if (tblName === "discos") {
                    loadTabulatorDiscos(data_parse);
                } else if (tblName === "pastillas") {
                    loadTabulatorPastillas(data_parse);
                }
            })
            .catch(error => console.error('Error al cargar los datos:', error))
            .finally(() => {
                // Oculta el loading de carga cuando se obtienen los datos
                document.querySelector('.loader-overlay').style.display = 'none';
            });
    } else {
        // Obtiene los datos JSON directamente del HTML si fetch_check es falso
        var jsonCatalogoString = document.getElementById('json-catalogo').textContent;
        var jsonCatalogo = JSON.parse(jsonCatalogoString);
        // Comprueba si hay datos en el catálogo JSON
        if (Object.keys(jsonCatalogo).length > 0) {
             // Oculta el indicador de carga si hay datos disponibles
            document.querySelector('.loader-overlay').style.display = 'none';
            // Carga los datos en las tablas correspondientes
            loadTabulatorDiscos(jsonCatalogo);
            loadTabulatorPastillas(jsonCatalogo);
        }
    }
}
// Función para crear la tabla de discos
function createTableDiscos(jsonData) {
    // Crear una nueva tabla Tabulator en el contenedor con id "tabla_discos"
    var table = new Tabulator("#tabla_discos", {
        layout: "fitColumns",// Ajustar el diseño para que se ajuste automáticamente al tamaño de las columnas
        data: jsonData,// Establecer los datos de la tabla con el JSON proporcionado
        pagination: "local",// Habilitar paginación local (en el lado del cliente)
        paginationSize: 10,// Establecer el tamaño de la paginación
        locale: "es-es",
        langs: { "es-es": spanishLanguageConfig },
        columns: [
            // Configuración de cada columna: título, campo, anchura mínima y máxima, alineación horizontal y vertical, editor (si es editable)
            { title: "Id", field: "id", minWidth: 75, maxWidth: 75, hozAlign: "center", vertAlign: "middle" },
            { title: "Código", field: "codigo", minWidth: 170, maxWidth: 170, hozAlign: "center", editor: "input", editable: true, vertAlign: "middle" },
            { title: "Tipo", field: "tipo", minWidth: 170, maxWidth: 170, hozAlign: "center", vertAlign: "middle" },
            { title: "Aplicación", field: "aplicacion", minWidth: 360, maxWidth: 360, editor: "input", editable: true, vertAlign: "middle" },
            { title: "Pastilla", field: "codigoPastilla", minWidth: 170, maxWidth: 170, hozAlign: "center", editor: "input", editable: true, vertAlign: "middle" },
            { title: "Lado", field: "lado", hozAlign: "center", minWidth: 140, maxWidth: 140, editor: "input", editable: true, vertAlign: "middle" },
            {
                // Configuración especial para la columna de "Precio" con un formateador personalizado
                title: "Precio", field: "pvp", hozAlign: "center", minWidth: 140, maxWidth: 140, editor: "input", editable: true, vertAlign: "middle",
                formatter: function (cell, formatterParams, onRendered) {
                    var value = cell.getValue();
                    return "$" + value;
                }
            },
            {
                // Columna de "Eliminar" con un botón de eliminación personalizado
                title: "Eliminar", field: "eliminar", hozAlign: "center", minWidth: 90, vertAlign: "middle",
                formatter: deleteButtonFormatter,// Usar un formateador personalizado para el botón de eliminación
                cellClick: function (e, cell) {
                    // Manejar el clic en el botón de eliminación
                    if (e.target.classList.contains('bx-trash')) {
                        handleDeleteButtonClick(e, cell, "discos", "btnGuardarDisco");
                    }
                }
            }
        ],
        // Función para manejar la edición de celdas
        cellEdited: function (cell) {
            if (editableCellsDisco === true) {
                var newValue = cell.getValue();
                var fieldName = cell.getColumn().getField();
                var rowIndex = cell.getRow().getIndex();
                updateRowJson(rowIndex, fieldName, newValue, "discos");
            }
        },
        headerHozAlign: "center",
        headerSort: false,
        // Función para manejar el filtrado de datos
        dataFiltered: function (filters, rows) {
            if (rows.length === 0) {
                document.getElementById("message-tbldisco").style.display = 'block';
            } else {
                document.getElementById("message-tbldisco").style.display = 'none';
            }
        }
    });
    // Agregar un filtro global a la tabla para buscar en todas las columnas
    var globalFilterInput = document.querySelector("#filtro-global-discos input");
    globalFilterInput.addEventListener("input", function (e) {
        var filterValue = e.target.value.trim();
        if (filterValue === '') {
            table.clearFilter(); // Borrar el filtro si el valor está vacío
        } else {
            // Aplicar un filtro personalizado basado en el valor ingresado
            table.setFilter(function (data) {
                return data.codigo.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.aplicacion.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.codigoPastilla.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.tipo.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.lado.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.pvp.toLowerCase().includes(filterValue.toLowerCase());
            });
        }
    });
}
// Función para crear la tabla de pastillas
function createTablePastillas(jsonData) {
    var table = new Tabulator("#tabla_pastillas", { // Crear una nueva tabla Tabulator en el contenedor con id "tabla_pastillas"
        layout: "fitColumns", // Ajustar el diseño para que se ajuste automáticamente al tamaño de las columnas
        data: jsonData, // Establecer los datos de la tabla con el JSON proporcionado
        pagination: "local", // Habilitar paginación local (en el lado del cliente)
        paginationSize: 10,// Establecer el tamaño de la paginación
        locale: "es-es",
        langs: { "es-es": spanishLanguageConfig },// Configurar el idioma español
        columns: [
            // Configuración de cada columna: título, campo, anchura mínima y máxima, alineación horizontal y vertical, editor (si es editable)
            { title: "Id", field: "id", minWidth: 75, maxWidth: 75, hozAlign: "center", vertAlign: "middle" },
            { title: "Código", field: "codigo", minWidth: 150, maxWidth: 150, hozAlign: "center", editor: "input", vertAlign: "middle" },
            { title: "Tipo", field: "tipo", minWidth: 150, maxWidth: 150, hozAlign: "center", vertAlign: "middle" },
            { title: "Aplicación", field: "aplicacion", minWidth: 330, maxWidth: 330, editor: "input", vertAlign: "middle" },
            {
                 // Columna de "Foto" con un formateador personalizado para mostrar una imagen y permitir cambiarla
                title: "Foto", field: "fotoReferencial", minWidth: 120, maxWidth: 120, hozAlign: "center", vertAlign: "middle",
                formatter: function (cell, formatterParams, onRendered) {
                    return "<div class='input-group'><i class='bx bx-search' title='Ver foto' onclick='showModalImage(\"" + cell.getValue() + "\")'></i>&nbsp;<label class='css-boton boton-success btn-sm imglabel' for='fileInput'>Cambiar</label>" +
                        "<input class='fileInput' type='file' accept='.jpg, .png'/></div>";
                },
                cellClick: function (e, cell) {
                     // Manejar el clic en la celda de la imagen
                    if (e.target.classList.contains('imglabel')) {
                        var fileInput = cell.getElement().querySelector('.fileInput');
                        fileInput.click();
                        if (!fileInput.dataset.changeListenerAdded) {
                            // Agregar un listener para el cambio de archivo solo si aún no se ha agregado
                            if (checkUpdateImage === true) {
                                fileInput.addEventListener('change', function (event) {
                                    var selectedFile = event.target.files[0];
                                    // Validar el tamaño de la imagen seleccionada antes de actualizarla
                                    if (validateSizeImage(selectedFile) === true) {
                                        event.target.value = '';
                                        return;
                                    } else {
                                        // Actualizar la imagen
                                        updateFoto(selectedFile, cell.getValue(), cell.getRow().getData().id);
                                    }
                                });
                            }
                            fileInput.dataset.changeListenerAdded = true;
                        }
                    }
                },
            },
            { title: "Ancho", field: "ancho", minWidth: 100, maxWidth: 100, hozAlign: "center", editor: "input", vertAlign: "middle" },
            { title: "Altura", field: "altura", hozAlign: "center", minWidth: 100, maxWidth: 100, editor: "input", vertAlign: "middle" },
            { title: "Grosor", field: "grosor", hozAlign: "center", minWidth: 100, maxWidth: 100, editor: "input", vertAlign: "middle" },
            {
                // Configuración especial para la columna de "Precio" con un formateador personalizado
                title: "Precio", field: "pvp", hozAlign: "center", minWidth: 100, maxWidth: 100, editor: "input", vertAlign: "middle",
                formatter: function (cell, formatterParams, onRendered) {
                    var value = cell.getValue();
                    return "$" + value;
                }
            },
            {
                // Columna de "Eliminar" con un botón de eliminación personalizado
                title: "Eliminar", field: "eliminar", hozAlign: "center", minWidth: 95, vertAlign: "middle",
                formatter: deleteButtonFormatter,
                cellClick: function (e, cell) {
                    // Manejar el clic en el botón de eliminación
                    if (e.target.classList.contains('bx-trash')) {
                        handleDeleteButtonClick(e, cell, "pastillas", "btnGuardarPastilla");
                    }
                }
            }
        ],
        cellEdited: function (cell) {
            // Manejar la edición de celdas si las celdas son editables
            if (editableCellsPastilla === true) {
                var newValue = cell.getValue();
                var fieldName = cell.getColumn().getField();
                var rowIndex = cell.getRow().getIndex();
                updateRowJson(rowIndex, fieldName, newValue, "pastillas");
            }
        },
        headerHozAlign: "center",
        headerSort: false,
        dataFiltered: function (filters, rows) {
            // Mostrar un mensaje cuando no hay resultados después de aplicar filtros
            if (rows.length === 0) {
                document.getElementById("message-tblpastilla").style.display = 'block';
            } else {
                document.getElementById("message-tblpastilla").style.display = 'none';
            }
        }
    });
    // Configurar un filtro global para la tabla de pastillas
    var globalFilterInput = document.querySelector("#filtro-global-pastillas input");
    globalFilterInput.addEventListener("input", function (e) {
        var filterValue = e.target.value.trim();
        if (filterValue === '') {
            table.clearFilter();// Borrar el filtro si el valor está vacío
        } else {
            // Aplicar un filtro personalizado basado en el valor ingresado
            table.setFilter(function (data) {
                return data.codigo.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.aplicacion.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.ancho.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.tipo.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.altura.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.grosor.toLowerCase().includes(filterValue.toLowerCase()) ||
                    data.pvp.toLowerCase().includes(filterValue.toLowerCase());
            });
        }
    });
}
// Función para mostrar una imagen en un modal
function showModalImage(value) {
    var modal = document.getElementById("modalFoto");
    var modalImg = document.getElementById("foto");
    modalImg.src = value;
    modalImg.style.minWidth = "150px";
    modalImg.style.maxHeight = "150px";
    modal.style.display = "block";
    var closeBtn = modal.querySelector(".close");
    closeBtn.onclick = function () {
        modal.style.display = "none";
    };
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}
// Función para establecer el botón de eliminar en una tabla
function deleteButtonFormatter(cell) {
    return "<i class='bx bx-trash' title='Eliminar'></i>";
}
// Función para manejar el clic en el botón de eliminar
function handleDeleteButtonClick(e, cell, tblName, idBtn) {
    // Mostrar un mensaje de confirmación antes de eliminar
    Swal.fire({
        title: '<h5>¿Está seguro?<h5>',
        text: 'Se eliminará el registro',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        width: "330px",
    }).then((result) => {// Manejar la acción después de que el usuario confirme o cancele
        if (result.isConfirmed) {
            // Manejar la eliminación del registro
            if ((tblName === "discos" && deletedRowDisco === false) || (tblName === "pastillas" && deletedRowPastilla === false)) {
                var table = Tabulator.prototype.findTable("#tabla_" + tblName)[0];
                cell.getRow().delete();// Eliminar fila
                // Habilitar todas las filas deshabilitadas
                table.getRows().forEach(function (row) {
                    row.getElement().classList.remove("disabled-row");
                });
                disableButtonSave(false, idBtn);// Deshabilita el botón de guardar
                //Marcar las celdas como editables dependiendo la tabla
                if (tblName === "discos") {
                    editableCellsDisco = true;
                } else if (tblName === "pastillas") {
                    editableCellsPastilla = true;
                }
            } else if ((tblName === "discos" && deletedRowDisco === true) || (tblName === "pastillas" && deletedRowPastilla === true)) {
                var rowIndex = cell.getRow().getIndex();
                var prevUrlImage = null; // URL de la imagen previa (solo para pastillas)
                if (tblName === "pastillas") {
                     // Obtener la URL de la imagen previa
                    prevUrlImage = cell.getRow().getData().fotoReferencial;
                }
                cell.getRow().delete();
                deleteRowFromJson(rowIndex, tblName, prevUrlImage); // Eliminar la fila del JSON
                disableButtonSave(false, idBtn); //Habilita el botón de guardar
            }
        }
    });
}
// Función para eliminar una fila del archivo JSON
function deleteRowFromJson(rowIndex, tblName, prevUrlImage) {
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            rowIndex: rowIndex,
            tblName: tblName,
            prevurl: prevUrlImage
        })
    };
    success = false;
    fetch("/delete_data/", requestOptions)
        .then(res => {
            if (res.ok) {
                loadJsonData(tblName, true);
                success = true;
            }
            return res.text()
        })
        .then(message => {
            if (tblName === "discos") {
                setMessage("msg-disco", message, success);
            } else if (tblName === "pastillas") {
                setMessage("msg-pastilla", message, success);
            }
        })
}
// Cargar los datos JSON al cargar la ventana
window.addEventListener("load", function () {
    loadJsonData();
});