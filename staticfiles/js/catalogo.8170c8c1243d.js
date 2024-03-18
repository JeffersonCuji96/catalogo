var editableCellsDisco = true;
var editableCellsPastilla = true;
var deletedRowDisco = true;
var deletedRowPastilla = true;
var checkUpdateImage = true;

function getCSRFToken() {
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    return csrfToken;
}
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
function addRowDisco() {
    deletedRowDisco = false;
    var table = Tabulator.prototype.findTable("#tabla_discos")[0];
    var lastRow = table.getData().pop();
    var newId = lastRow ? lastRow.id + 1 : 1;

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
    }).then(function (result) {
        if (result.isConfirmed) {
            disableButtonSave(true, "btnGuardarDisco");
            var rowData = {
                id: newId,
                codigo: "",
                tipo: result.value,
                aplicacion: "",
                codigoPastilla: "",
                lado: "",
                pvp: "0.00"
            };
            editableCellsDisco = false;
            table.getRows().forEach(function (row) {
                row.getElement().classList.add("disabled-row");
            });

            table.addRow(rowData, true).then(function (row) {
                var deleteCell = row.getCell("eliminar");
                deleteCell.getElement().innerHTML += "&nbsp;&nbsp;<i class='bx bx-save' title='Guardar'></i>";
                deleteCell.getElement().querySelector("i.bx-save").addEventListener("click", function () {
                    if (!row.getData().codigo) {
                        validateInputTable("El código del disco es requerido");
                    } else if (!row.getData().pvp || Number(row.getData().pvp) === 0) {
                        validateInputTable("El precio del disco es requerido");
                    } else {
                        addRowJson(row.getData(), "discos", "btnGuardarDisco");
                    }
                });
            });
        }
    });
}

function validateInputTable(msg) {
    Swal.fire({
        html: "<h4>" + msg + "</h4>",
        icon: "info",
        width: "300px",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6"
    });
}

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

function hideElementCellFoto(fotoCell, label) {
    fotoCell.getElement().querySelector('.bx-search').style.display = "none";
    label.textContent = "Seleccionar";
    label.style.marginRight = "10px";
}
function createLabelFotoRegister() {
    var lblImage = document.querySelector('.input-group .imglabel');
    var paragraph = document.createElement('p');
    paragraph.style.fontSize = '11px';
    paragraph.textContent = 'Ninguna foto';
    lblImage.insertAdjacentElement('afterend', paragraph);
}
function setTextLabelFoto(msg) {
    var last_paragraph = document.querySelector('.input-group p');
    last_paragraph.textContent = msg;
}
function addRowPastilla() {
    deletedRowPastilla = false;
    checkUpdateImage = false;
    var table = Tabulator.prototype.findTable("#tabla_pastillas")[0];
    var lastRow = table.getData().pop();
    var newId = lastRow ? lastRow.id + 1 : 1;

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
    }).then(function (result) {
        if (result.isConfirmed) {
            disableButtonSave(true, "btnGuardarPastilla");
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
            editableCellsPastilla = false;
            table.getRows().forEach(function (row) {
                row.getElement().classList.add("disabled-row");
            });
            table.addRow(rowData, true).then(function (row) {
                var deleteCell = row.getCell("eliminar");
                var fotoCell = row.getCell("fotoReferencial");
                var lastFileInput = document.querySelector('.fileInput');
                var label = lastFileInput.parentElement.querySelector('label');

                hideElementCellFoto(fotoCell, label);
                createLabelFotoRegister();
                lastFileInput.addEventListener('change', function (event) {
                    var selectedFile = event.target.files[0];
                    if (selectedFile) {
                        if (validateSizeImage(selectedFile) === true) {
                            event.target.value = '';
                            return;
                        } else {
                            setTextLabelFoto("Foto seleccionada");
                            var reader = new FileReader();
                            reader.onload = function (event) {
                                var base64String = event.target.result;
                                row.getData().fotoReferencial = base64String;
                            };
                            reader.readAsDataURL(selectedFile);
                        }
                    }
                });

                deleteCell.getElement().innerHTML += "&nbsp;&nbsp;<i class='bx bx-save' title='Guardar'></i>";
                deleteCell.getElement().querySelector("i.bx-save").addEventListener("click", function () {
                    if (!row.getData().codigo) {
                        validateInputTable("El código de la pastilla es requerido");
                    } else if (!row.getData().pvp || Number(row.getData().pvp) === 0) {
                        validateInputTable("El precio de la pastilla es requerido");
                    } else {
                        addRowJson(row.getData(), "pastillas", "btnGuardarPastilla");
                    }
                });
            });
        }
    });
}
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

function addRowJson(objeto, tblName, idBtn) {
    delete objeto.eliminar;
    success = false;
    fetch('/add_data/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ objeto: objeto, tblName: tblName })
    }).then(res => {
        if (res.ok) {
            disableButtonSave(false, idBtn);
            loadJsonData(tblName, true);
            success = true;
        }
        return res.text()
    }).then(message => {
        if (tblName === "discos") {
            setMessage("msg-disco", message, success);
            editableCellsDisco = true;
            deletedRowDisco = true;
        } else if (tblName === "pastillas") {
            setMessage("msg-pastilla", message, success);
            editableCellsPastilla = true;
            deletedRowPastilla = true;
            checkUpdateImage = true;
        }
    })
}
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
function loadTabulatorDiscos(data) {
    var tableDiscos = Tabulator.prototype.findTable("#tabla_discos")[0];
    if (!tableDiscos) {
        createTableDiscos(data.discos);
    } else {
        tableDiscos.setData(data.discos);
    }
}
function loadTabulatorPastillas(data) {
    var tablePastillas = Tabulator.prototype.findTable("#tabla_pastillas")[0];
    if (!tablePastillas) {
        createTablePastillas(data.pastillas);
    } else {
        tablePastillas.setData(data.pastillas);
    }
}

function loadJsonData(tblName = undefined, fetch_check = false) {
    if (fetch_check === true) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        };
        fetch("/", requestOptions)
            .then(response => response.text())
            .then(data => {
                data_parse = JSON.parse(data);
                if (tblName === "discos") {
                    loadTabulatorDiscos(data_parse);
                } else if (tblName === "pastillas") {
                    loadTabulatorPastillas(data_parse);
                }
            })
            .catch(error => console.error('Error al cargar los datos:', error))
            .finally(() => {
                document.querySelector('.loader-overlay').style.display = 'none';
            });
    } else {
        var jsonCatalogoString = document.getElementById('json-catalogo').textContent;
        var jsonCatalogo = JSON.parse(jsonCatalogoString);
        if (Object.keys(jsonCatalogo).length > 0) {
            document.querySelector('.loader-overlay').style.display = 'none';
            loadTabulatorDiscos(jsonCatalogo);
            loadTabulatorPastillas(jsonCatalogo);
        }
    }
}

function createTableDiscos(jsonData) {
    var table = new Tabulator("#tabla_discos", {
        layout: "fitColumns",
        data: jsonData,
        pagination: "local",
        paginationSize: 10,
        locale: "es-es",
        langs: { "es-es": spanishLanguageConfig },
        columns: [
            { title: "Id", field: "id", minWidth: 75, maxWidth: 75, hozAlign: "center", vertAlign: "middle" },
            { title: "Código", field: "codigo", minWidth: 170, maxWidth: 170, hozAlign: "center", editor: "input", editable: true, vertAlign: "middle" },
            { title: "Tipo", field: "tipo", minWidth: 170, maxWidth: 170, hozAlign: "center", vertAlign: "middle" },
            { title: "Aplicación", field: "aplicacion", minWidth: 360, maxWidth: 360, editor: "input", editable: true, vertAlign: "middle" },
            { title: "Pastilla", field: "codigoPastilla", minWidth: 170, maxWidth: 170, hozAlign: "center", editor: "input", editable: true, vertAlign: "middle" },
            { title: "Lado", field: "lado", hozAlign: "center", minWidth: 140, maxWidth: 140, editor: "input", editable: true, vertAlign: "middle" },
            {
                title: "Precio", field: "pvp", hozAlign: "center", minWidth: 140, maxWidth: 140, editor: "input", editable: true, vertAlign: "middle",
                formatter: function (cell, formatterParams, onRendered) {
                    var value = cell.getValue();
                    return "$" + value;
                }
            },
            {
                title: "Eliminar", field: "eliminar", hozAlign: "center", minWidth: 90, vertAlign: "middle",
                formatter: deleteButtonFormatter,
                cellClick: function (e, cell) {
                    if (e.target.classList.contains('bx-trash')) {
                        handleDeleteButtonClick(e, cell, "discos", "btnGuardarDisco");
                    }
                }
            }
        ],
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
        dataFiltered: function (filters, rows) {
            if (rows.length === 0) {
                document.getElementById("message-tbldisco").style.display = 'block';
            } else {
                document.getElementById("message-tbldisco").style.display = 'none';
            }
        }
    });

    var globalFilterInput = document.querySelector("#filtro-global-discos input");
    globalFilterInput.addEventListener("input", function (e) {
        var filterValue = e.target.value.trim();
        if (filterValue === '') {
            table.clearFilter();
        } else {
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
function createTablePastillas(jsonData) {
    var table = new Tabulator("#tabla_pastillas", {
        layout: "fitColumns",
        data: jsonData,
        pagination: "local",
        paginationSize: 10,
        locale: "es-es",
        langs: { "es-es": spanishLanguageConfig },
        columns: [
            { title: "Id", field: "id", minWidth: 75, maxWidth: 75, hozAlign: "center", vertAlign: "middle" },
            { title: "Código", field: "codigo", minWidth: 150, maxWidth: 150, hozAlign: "center", editor: "input", vertAlign: "middle" },
            { title: "Tipo", field: "tipo", minWidth: 150, maxWidth: 150, hozAlign: "center", vertAlign: "middle" },
            { title: "Aplicación", field: "aplicacion", minWidth: 330, maxWidth: 330, editor: "input", vertAlign: "middle" },
            {
                title: "Foto", field: "fotoReferencial", minWidth: 120, maxWidth: 120, hozAlign: "center", vertAlign: "middle",
                formatter: function (cell, formatterParams, onRendered) {
                    return "<div class='input-group'><i class='bx bx-search' title='Ver foto' onclick='showModalImage(\"" + cell.getValue() + "\")'></i>&nbsp;<label class='css-boton boton-success btn-sm imglabel' for='fileInput'>Cambiar</label>" +
                        "<input class='fileInput' type='file' accept='.jpg, .png'/></div>";
                },
                cellClick: function (e, cell) {
                    if (e.target.classList.contains('imglabel')) {
                        var fileInput = cell.getElement().querySelector('.fileInput');
                        fileInput.click();
                        if (!fileInput.dataset.changeListenerAdded) {
                            if (checkUpdateImage === true) {
                                fileInput.addEventListener('change', function (event) {
                                    var selectedFile = event.target.files[0];
                                    if (validateSizeImage(selectedFile) === true) {
                                        event.target.value = '';
                                        return;
                                    } else {
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
                title: "Precio", field: "pvp", hozAlign: "center", minWidth: 100, maxWidth: 100, editor: "input", vertAlign: "middle",
                formatter: function (cell, formatterParams, onRendered) {
                    var value = cell.getValue();
                    return "$" + value;
                }
            },
            {
                title: "Eliminar", field: "eliminar", hozAlign: "center", minWidth: 95, vertAlign: "middle",
                formatter: deleteButtonFormatter,
                cellClick: function (e, cell) {
                    if (e.target.classList.contains('bx-trash')) {
                        handleDeleteButtonClick(e, cell, "pastillas", "btnGuardarPastilla");
                    }
                }
            }
        ],
        cellEdited: function (cell) {
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
            if (rows.length === 0) {
                document.getElementById("message-tblpastilla").style.display = 'block';
            } else {
                document.getElementById("message-tblpastilla").style.display = 'none';
            }
        }
    });

    var globalFilterInput = document.querySelector("#filtro-global-pastillas input");
    globalFilterInput.addEventListener("input", function (e) {
        var filterValue = e.target.value.trim();
        if (filterValue === '') {
            table.clearFilter();
        } else {
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
function deleteButtonFormatter(cell) {
    return "<i class='bx bx-trash' title='Eliminar'></i>";
}
function handleDeleteButtonClick(e, cell, tblName, idBtn) {
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
    }).then((result) => {
        if (result.isConfirmed) {
            if ((tblName === "discos" && deletedRowDisco === false) || (tblName === "pastillas" && deletedRowPastilla === false)) {
                var table = Tabulator.prototype.findTable("#tabla_" + tblName)[0];
                cell.getRow().delete();
                table.getRows().forEach(function (row) {
                    row.getElement().classList.remove("disabled-row");
                });
                disableButtonSave(false, idBtn);
                if (tblName === "discos") {
                    editableCellsDisco = true;
                } else if (tblName === "pastillas") {
                    editableCellsPastilla = true;
                }
            } else if ((tblName === "discos" && deletedRowDisco === true) || (tblName === "pastillas" && deletedRowPastilla === true)) {
                var rowIndex = cell.getRow().getIndex();
                var prevUrlImage = null;
                if (tblName === "pastillas") {
                    prevUrlImage = cell.getRow().getData().fotoReferencial;
                }
                cell.getRow().delete();
                deleteRowFromJson(rowIndex, tblName, prevUrlImage);
                disableButtonSave(false, idBtn);
            }
        }
    });
}
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

window.addEventListener("load", function () {
    loadJsonData();
});