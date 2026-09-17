// Bases de datos simuladas en LocalStorage
let users = JSON.parse(localStorage.getItem('sys_users')) || [];
let patients = JSON.parse(localStorage.getItem('sys_patients')) || [];
let consultations = JSON.parse(localStorage.getItem('sys_consultations')) || []; // Nuevo arreglo para consultas
let currentUser = null;

// --- FUNCIONES DE AUTENTICACIÓN ---
function toggleAuth() {
    document.getElementById('login-card').classList.toggle('hidden');
    document.getElementById('register-card').classList.toggle('hidden');
}

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (users.find(u => u.name === name)) {
        alert("El usuario ya existe.");
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem('sys_users', JSON.stringify(users));
    alert("Usuario creado exitosamente. Inicia sesión.");
    toggleAuth();
    this.reset();
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.name === name && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        document.getElementById('welcome-msg').innerText = `Bienvenido(a), ${user.name}`;
        loadPatientData();
    } else {
        alert("Credenciales incorrectas.");
    }
});

function logout() {
    currentUser = null;
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('login-form').reset();
}

// --- FUNCIONES DEL SISTEMA NUTRICIONAL ---

function getDiagnosticoIMC(imc) {
    if (imc < 18.5) return "BAJO PESO";
    if (imc >= 18.5 && imc <= 24.9) return "NORMAL";
    if (imc >= 25 && imc <= 29.9) return "SOBREPESO";
    return "OBESIDAD";
}

function calculateIMC() {
    const weight = parseFloat(document.getElementById('pat-weight').value);
    const height = parseFloat(document.getElementById('pat-height').value);
    const display = document.getElementById('imc-display');

    if (weight > 0 && height > 0) {
        const imc = (weight / (height * height)).toFixed(2);
        const diag = getDiagnosticoIMC(imc);
        display.innerHTML = `IMC calculado: <strong>${imc}</strong> <span style="color:${diag === 'NORMAL' ? 'green' : 'orange'}">${diag}</span>`;
        return { imc, diag };
    }
    display.innerHTML = "IMC calculado: 0.00 | N/A";
    return null;
}

document.getElementById('patient-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const dataIMC = calculateIMC();
    if (!dataIMC) return alert("Ingresa peso y altura válidos");

    const newPatient = {
        id: Date.now(), // ID único basado en la fecha
        name: document.getElementById('pat-name').value.toUpperCase(),
        age: document.getElementById('pat-age').value,
        sex: document.getElementById('pat-sex').value,
        weight: document.getElementById('pat-weight').value,
        height: document.getElementById('pat-height').value,
        imc: dataIMC.imc,
        diagnosis: dataIMC.diag
    };

    patients.push(newPatient);
    localStorage.setItem('sys_patients', JSON.stringify(patients));
    
    alert("Paciente guardado con éxito");
    this.reset();
    document.getElementById('imc-display').innerHTML = "IMC calculado: 0.00 | N/A";
    loadPatientData();
});

function loadPatientData() {
    // Llenar select de consultas
    const select = document.getElementById('cons-patient');
    select.innerHTML = '<option value="">Selecciona un paciente...</option>';
    
    // Llenar tabla de historial de pacientes
    const tbody = document.querySelector('#patients-table tbody');
    tbody.innerHTML = '';

    patients.forEach(p => {
        // Agregar al Select
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name} (${p.diagnosis})`;
        select.appendChild(option);

        // Agregar a la Tabla
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.sex}</td>
            <td>${p.weight} kg</td>
            <td>${p.height} m</td>
            <td>${p.imc}</td>
            <td>${p.diagnosis}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updatePatientTags() {
    const select = document.getElementById('cons-patient');
    const tagsDiv = document.getElementById('patient-tags');
    tagsDiv.innerHTML = '';

    if (!select.value) return;

    const patient = patients.find(p => p.id == select.value);
    if (patient) {
        tagsDiv.innerHTML = `
            <span>${patient.age} años - ${patient.sex}</span>
            <span>${patient.weight} kg / ${patient.height} m</span>
            <span>IMC: ${patient.imc}</span>
            <span>${patient.diagnosis}</span>
        `;
    }
}

// GUARDAR CONSULTA
document.getElementById('consultation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const patientId = document.getElementById('cons-patient').value;
    
    if(!patientId) {
        return alert("Por favor selecciona un paciente.");
    }
    
    // Recolectar los datos del formulario de la consulta
    const newConsultation = {
        id: Date.now(), // ID único para la consulta
        patientId: patientId, // ID del paciente al que pertenece
        date: document.getElementById('cons-date').value,
        time: document.getElementById('cons-time').value,
        evolution: document.getElementById('cons-evolution').value,
        plan: document.getElementById('cons-plan').value
    };

    // Guardar en el arreglo y luego en LocalStorage
    consultations.push(newConsultation);
    localStorage.setItem('sys_consultations', JSON.stringify(consultations));
    
    alert("Consulta guardada exitosamente.");
    
    // Limpiar el formulario
    this.reset();
    document.getElementById('patient-tags').innerHTML = '';
    
    // Restaurar fecha y hora actual después de limpiar
    setConsultationDateTime();
});

// Función para inicializar/restaurar la fecha y hora actual
function setConsultationDateTime() {
    document.getElementById('cons-date').valueAsDate = new Date();
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('cons-time').value = now.toISOString().slice(11,16);
}

// Inicializar fecha y hora al cargar el script
setConsultationDateTime();