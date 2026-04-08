// Variables globales
let datos = [];
let datosFiltrados = [];

// Elementos DOM
const tableBody = document.querySelector('#dataTable tbody');
const downloadBtn = document.getElementById('downloadBtn');
const loadFileInput = document.getElementById('loadFile');
const filterDateBtn = document.getElementById('filterDateBtn');
const monthSelect = document.getElementById('monthSelect');
const yearSelect = document.getElementById('yearSelect');
const showAllDatesBtn = document.getElementById('showAllDatesBtn');
const filterProductBtn = document.getElementById('filterProductBtn');
const showAllProductsBtn = document.getElementById('showAllProductsBtn');
const productSelect = document.getElementById('productSelect');
const totalsContainer = document.getElementById('totalsContainer');

// Función para generar y descargar plantilla XLSX
function descargarPlantilla() {
    const wb = XLSX.utils.book_new();
    const ws_data = [
        ['DATE', 'PRODUCT TYPE', 'UNITS', 'AMOUNT'],
        ['01/01/2024', 'PRODUCT A', 10, 100],
        ['15/02/2024', 'PRODUCT B', 5, 50],
        ['10/03/2024', 'PRODUCT C', 20, 200],
        ['25/01/2024', 'PRODUCT A', 7, 70],
        ['05/02/2024', 'PRODUCT C', 12, 120],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla.xlsx');
}

// Evento para descargar plantilla
downloadBtn.addEventListener('click', descargarPlantilla);

// Función para cargar y leer archivo XLSX
loadFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {header:1});

        datos = [];
        const headers = jsonData[0];

        for (let i=1; i<jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 4) {
                const obj = {
                    DATE: row[0],
                    PRODUCT_TYPE: row[1],
                    UNITS: parseInt(row[2]),
                    AMOUNT: parseFloat(row[3])
                };
                datos.push(obj);
            }
        }

        mostrarDatos(datos);
        actualizarProductos();

        monthSelect.value = '';
        yearSelect.value = '';
        productSelect.value = '';
        mostrarTotalesGenerales(datos);
    };
    reader.readAsArrayBuffer(file);
});

// Función para mostrar datos en la tabla
function mostrarDatos(data) {
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.DATE}</td>
            <td>${item.PRODUCT_TYPE}</td>
            <td>${item.UNITS}</td>
            <td>${item.AMOUNT.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para actualizar la lista de productos en el select
function actualizarProductos() {
    const productos = Array.from(new Set(datos.map(d => d.PRODUCT_TYPE))).sort();
    productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    productos.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        productSelect.appendChild(option);
    });
}

// Función para filtrar por fecha (mes + año)
filterDateBtn.addEventListener('click', () => {
    const mesSeleccionado = monthSelect.value;
    const añoSeleccionado = yearSelect.value;

    if (!mesSeleccionado || !añoSeleccionado) {
        alert('Por favor, selecciona mes y año.');
        return;
    }

    datosFiltrados = datos.filter(d => {
        const fechaParts = d.DATE.split('/');
        if (fechaParts.length !== 3) return false;
        const [dd, mm, yyyy] = fechaParts;
        return mm === mesSeleccionado && yyyy === añoSeleccionado;
    });

    mostrarDatos(datosFiltrados);
    mostrarTotalesGenerales(datosFiltrados);
});

// Función para mostrar todas las fechas
showAllDatesBtn.addEventListener('click', () => {
    datosFiltrados = datos; // reset
    mostrarDatos(datos);
    mostrarTotalesGenerales(datos);
    monthSelect.value = '';
    yearSelect.value = '';
});

// Función para filtrar por producto (aplicado sobre el resultado de fecha si existe)
filterProductBtn.addEventListener('click', () => {
    const productoSeleccionado = productSelect.value;
    if (!productoSeleccionado) {
        alert('Por favor, selecciona un producto.');
        return;
    }

    // Si hay un filtro de fecha activo, usar datosFiltrados; si no, usar todos los datos
    const baseDatos = (monthSelect.value && yearSelect.value) ? datosFiltrados : datos;

    const filtrados = baseDatos.filter(d => d.PRODUCT_TYPE === productoSeleccionado);
    mostrarDatos(filtrados);
    mostrarTotales(filtrados, productoSeleccionado);
});

// Función para mostrar todos los productos (aplicado sobre el resultado de fecha si existe)
showAllProductsBtn.addEventListener('click', () => {
    const baseDatos = (monthSelect.value && yearSelect.value) ? datosFiltrados : datos;
    mostrarDatos(baseDatos);
    mostrarTotalesGenerales(baseDatos);
    productSelect.value = '';
});

// Función para mostrar totales por producto
function mostrarTotales(data, producto) {
    const totalUnits = data.reduce((sum, d) => sum + d.UNITS, 0);
    const totalAmount = data.reduce((sum, d) => sum + d.AMOUNT, 0);
    totalsContainer.innerHTML = `
        <h2>Totales para ${producto}</h2>
        <p>Unidades Totales: ${totalUnits}</p>
        <p>Monto Total: $${totalAmount.toFixed(2)}</p>
    `;
}

// Función para mostrar totales generales
function mostrarTotalesGenerales(data) {
    const totalUnits = data.reduce((sum, d) => sum + d.UNITS, 0);
    const totalAmount = data.reduce((sum, d) => sum + d.AMOUNT, 0);
    totalsContainer.innerHTML = `
        <h2>Totales Generales</h2>
        <p>Unidades Totales: ${totalUnits}</p>
        <p>Monto Total: $${totalAmount.toFixed(2)}</p>
    `;
}
