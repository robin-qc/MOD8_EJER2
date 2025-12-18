/* ===============================================
   CONTADOR INTERACTIVO MEJORADO
   ===============================================
   
   Funcionalidades originales preservadas:
   - Incrementar, decrementar y resetear contador
   - Cambio de color según valor
   - Botones bonus +5 y -5
   - Animaciones suaves
   - Persistencia con LocalStorage
   - Mensajes dinámicos
   - Atajos de teclado básicos
   
   Nuevas funcionalidades añadidas:
   - Sistema de tema claro/oscuro
   - Historial detallado con timestamps
   - Estadísticas en tiempo real
   - Selector de tamaño de paso
   - Valor en binario
   - Barra de progreso visual
   - Indicador de cambio
   - Acciones rápidas adicionales
   - Notificaciones
   - Exportación de historial
   =============================================== */

// ===== SELECCIÓN DE ELEMENTOS =====
const contadorElement = document.getElementById("contador");
const btnIncrementar = document.getElementById("btnIncrementar");
const btnDecrementar = document.getElementById("btnDecrementar");
const btnResetear = document.getElementById("btnResetear");
const btnIncrementar5 = document.getElementById("btnIncrementar5");
const btnDecrementar5 = document.getElementById("btnDecrementar5");
const mensajeElement = document.getElementById("mensaje");
const displayContador = document.querySelector(".contador-display");

// Nuevos elementos añadidos
const themeToggle = document.getElementById("themeToggle");
const soundToggle = document.getElementById("soundToggle");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const toggleHistoryBtn = document.getElementById("toggleHistory");
const historyModal = document.getElementById("historyModal");
const modalHistoryList = document.getElementById("modalHistoryList");
const modalCloseBtn = document.querySelector(".modal-close");
const exportHistoryBtn = document.getElementById("exportHistory");
const progressFill = document.getElementById("progressFill");
const binaryValue = document.getElementById("binaryValue");
const changeIndicator = document.getElementById("changeIndicator");
const trendIndicator = document.getElementById("trendIndicator");
const lastChangeTime = document.getElementById("lastChangeTime");
const statMin = document.getElementById("statMin");
const statMax = document.getElementById("statMax");
const statChanges = document.getElementById("statChanges");
const currentStep = document.getElementById("currentStep");
const notification = document.getElementById("notification");

// Elementos de acciones rápidas
const btnDecrementar10 = document.getElementById("btnDecrementar10");
const btnIncrementar10 = document.getElementById("btnIncrementar10");
const btnSetToMin = document.getElementById("btnSetToMin");
const btnSetToMax = document.getElementById("btnSetToMax");
const btnSetToZero = document.getElementById("btnSetToZero");

// Elementos de configuración
const stepButtons = document.querySelectorAll(".step-btn");
const progressMin = document.getElementById("progressMin");
const progressMax = document.getElementById("progressMax");

// ===== VARIABLES DEL CONTADOR =====
let contador = parseInt(localStorage.getItem("contador")) || 0;
let stepSize = parseInt(localStorage.getItem("stepSize")) || 1;
let minLimit = -100;
let maxLimit = 100;
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
let isDarkTheme = localStorage.getItem("isDarkTheme") === "true";

// Historial y estadísticas
let history = JSON.parse(localStorage.getItem("counterHistory")) || [];
let statistics = {
    min: 0,
    max: 0,
    totalChanges: 0,
    lastChange: null,
    lastChangeAmount: 0,
    trend: "neutral"
};

// ===== FUNCIONES ORIGINALES PRESERVADAS =====

function actualizarDisplay() {
    // Actualizar número
    contadorElement.textContent = contador;
    
    // Remover clases previas
    contadorElement.classList.remove("positivo", "negativo", "neutro", "changed");
    displayContador.classList.remove("bg-positivo", "bg-negativo", "bg-neutro");
    
    // Determinar estado y aplicar clases
    if (contador > 0) {
        contadorElement.classList.add("positivo");
        displayContador.classList.add("bg-positivo");
        actualizarMensaje("positivo");
    } else if (contador < 0) {
        contadorElement.classList.add("negativo");
        displayContador.classList.add("bg-negativo");
        actualizarMensaje("negativo");
    } else {
        contadorElement.classList.add("neutro");
        displayContador.classList.add("bg-neutro");
        actualizarMensaje("neutro");
    }
    
    // Animación de cambio
    contadorElement.classList.add("changed");
    setTimeout(() => contadorElement.classList.remove("changed"), 300);
    
    // Actualizar elementos adicionales
    updateBinaryValue();
    updateProgressBar();
    updateStatistics();
    updateChangeIndicator();
    
    // Guardar en LocalStorage
    localStorage.setItem("contador", contador);
}

function actualizarMensaje(estado) {
    let mensaje = "";
    
    switch (estado) {
        case "positivo":
            mensaje = `El contador está en <strong>positivo</strong> (+${contador})`;
            break;
        case "negativo":
            mensaje = `El contador está en <strong>negativo</strong> (${contador})`;
            break;
        case "neutro":
            mensaje = "El contador está en <strong>cero</strong>";
            break;
    }
    
    mensajeElement.innerHTML = mensaje;
}

function incrementar(cantidad = stepSize) {
    const oldValue = contador;
    contador += cantidad;
    
    // Registrar en historial
    addToHistory(oldValue, contador, cantidad);
    
    actualizarDisplay();
    playSound("increment");
    showNotification(`Incrementado en ${cantidad}`, "success");
}

function decrementar(cantidad = stepSize) {
    const oldValue = contador;
    contador -= cantidad;
    
    // Registrar en historial
    addToHistory(oldValue, contador, -cantidad);
    
    actualizarDisplay();
    playSound("decrement");
    showNotification(`Decrementado en ${cantidad}`, "success");
}

function resetear() {
    const oldValue = contador;
    contador = 0;
    
    // Registrar en historial
    addToHistory(oldValue, 0, -oldValue);
    
    actualizarDisplay();
    playSound("reset");
    showNotification("Contador reseteado a 0", "info");
}

// ===== NUEVAS FUNCIONES AÑADIDAS =====

// Sistema de historial
function addToHistory(oldValue, newValue, change) {
    const historyEntry = {
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        oldValue: oldValue,
        newValue: newValue,
        change: change,
        type: change > 0 ? "positive" : "negative"
    };
    
    history.unshift(historyEntry);
    
    // Mantener solo últimos 50 registros
    if (history.length > 50) {
        history.pop();
    }
    
    // Actualizar estadísticas
    updateStatisticsAfterChange(oldValue, newValue, change);
    
    // Guardar historial
    localStorage.setItem("counterHistory", JSON.stringify(history));
    
    // Actualizar vista de historial
    updateHistoryView();
}

function updateStatisticsAfterChange(oldValue, newValue, change) {
    statistics.totalChanges++;
    statistics.lastChange = new Date();
    statistics.lastChangeAmount = change;
    
    // Actualizar mínimo y máximo
    if (newValue < statistics.min) statistics.min = newValue;
    if (newValue > statistics.max) statistics.max = newValue;
    
    // Actualizar tendencia
    if (change > 0) statistics.trend = "ascendente";
    else if (change < 0) statistics.trend = "descendente";
    else statistics.trend = "neutral";
    
    // Guardar estadísticas
    localStorage.setItem("counterStats", JSON.stringify(statistics));
}

function updateHistoryView() {
    historyList.innerHTML = "";
    
    // Mostrar solo los últimos 5 elementos en el panel
    const recentHistory = history.slice(0, 5);
    
    recentHistory.forEach(entry => {
        const item = document.createElement("div");
        item.className = `history-item ${entry.type}`;
        item.innerHTML = `
            <div class="history-time">${entry.timestamp}</div>
            <div class="history-value">${entry.newValue}</div>
            <div class="history-change ${entry.type}">
                ${entry.change > 0 ? '+' : ''}${entry.change}
            </div>
        `;
        historyList.appendChild(item);
    });
}

function clearHistory() {
    history = [];
    statistics.totalChanges = 0;
    statistics.min = contador;
    statistics.max = contador;
    localStorage.removeItem("counterHistory");
    updateHistoryView();
    updateStatistics();
    showNotification("Historial limpiado", "info");
}

// Valor en binario
function updateBinaryValue() {
    const binary = (contador >>> 0).toString(2);
    binaryValue.textContent = `Binario: ${binary}`;
}

// Barra de progreso
function updateProgressBar() {
    const range = maxLimit - minLimit;
    const position = contador - minLimit;
    const percentage = (position / range) * 100;
    progressFill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    
    // Actualizar etiquetas de límites
    progressMin.textContent = minLimit;
    progressMax.textContent = maxLimit;
}

// Indicador de cambio
function updateChangeIndicator() {
    if (statistics.lastChangeAmount === 0) {
        changeIndicator.textContent = "";
        changeIndicator.className = "change-indicator";
        trendIndicator.textContent = "Neutral";
        return;
    }
    
    const isPositive = statistics.lastChangeAmount > 0;
    changeIndicator.textContent = `${isPositive ? '+' : ''}${statistics.lastChangeAmount}`;
    changeIndicator.className = `change-indicator ${isPositive ? 'positive' : 'negative'}`;
    trendIndicator.textContent = isPositive ? "Ascendente" : "Descendente";
    
    // Actualizar último cambio
    if (statistics.lastChange) {
        lastChangeTime.textContent = statistics.lastChange.toLocaleTimeString();
    }
}

// Estadísticas
function updateStatistics() {
    statMin.textContent = statistics.min;
    statMax.textContent = statistics.max;
    statChanges.textContent = statistics.totalChanges;
    currentStep.textContent = stepSize;
}

// Sistema de tema
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("dark-theme", isDarkTheme);
    localStorage.setItem("isDarkTheme", isDarkTheme);
    
    const icon = themeToggle.querySelector("i");
    icon.className = isDarkTheme ? "fas fa-sun" : "fas fa-moon";
    
    showNotification(`Tema ${isDarkTheme ? "oscuro" : "claro"} activado`, "info");
    playSound("click");
}

// Sonido
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled);
    
    const icon = soundToggle.querySelector("i");
    icon.className = soundEnabled ? "fas fa-volume-up" : "fas fa-volume-mute";
    
    showNotification(`Sonido ${soundEnabled ? "activado" : "desactivado"}`, "info");
    playSound("click");
}

function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case "increment":
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                break;
            case "decrement":
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                break;
            case "reset":
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                break;
            case "click":
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Fallback silencioso si el audio no funciona
    }
}

// Tamaño de paso
function setStepSize(step) {
    stepSize = step;
    stepButtons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    localStorage.setItem("stepSize", stepSize);
    showNotification(`Paso de incremento: ${stepSize}`, "info");
    playSound("click");
}

// Notificaciones
function showNotification(message, type = "success") {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// Modal de historial
function showHistoryModal() {
    modalHistoryList.innerHTML = "";
    
    history.forEach(entry => {
        const item = document.createElement("div");
        item.className = `history-item ${entry.type}`;
        item.innerHTML = `
            <div class="history-time">${entry.date} ${entry.timestamp}</div>
            <div class="history-value">${entry.oldValue} → ${entry.newValue}</div>
            <div class="history-change ${entry.type}">
                ${entry.change > 0 ? '+' : ''}${entry.change}
            </div>
        `;
        modalHistoryList.appendChild(item);
    });
    
    historyModal.classList.add("show");
    playSound("click");
}

function exportHistoryToCSV() {
    if (history.length === 0) {
        showNotification("No hay historial para exportar", "info");
        return;
    }
    
    let csvContent = "Fecha,Hora,Valor Anterior,Valor Nuevo,Cambio\n";
    
    history.forEach(entry => {
        csvContent += `${entry.date},${entry.timestamp},${entry.oldValue},${entry.newValue},${entry.change}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_contador_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification("Historial exportado como CSV", "success");
    playSound("click");
}

// Acciones rápidas adicionales
function setToMin() {
    const oldValue = contador;
    contador = minLimit;
    addToHistory(oldValue, contador, minLimit - oldValue);
    actualizarDisplay();
    showNotification(`Establecido al mínimo: ${minLimit}`, "info");
    playSound("click");
}

function setToMax() {
    const oldValue = contador;
    contador = maxLimit;
    addToHistory(oldValue, contador, maxLimit - oldValue);
    actualizarDisplay();
    showNotification(`Establecido al máximo: ${maxLimit}`, "info");
    playSound("click");
}

function setToZero() {
    const oldValue = contador;
    contador = 0;
    addToHistory(oldValue, 0, -oldValue);
    actualizarDisplay();
    showNotification("Establecido a cero", "info");
    playSound("click");
}

// ===== EVENT LISTENERS ORIGINALES =====
btnIncrementar.addEventListener("click", () => incrementar());
btnDecrementar.addEventListener("click", () => decrementar());
btnResetear.addEventListener("click", resetear);
btnIncrementar5.addEventListener("click", () => incrementar(5));
btnDecrementar5.addEventListener("click", () => decrementar(5));

// ===== NUEVOS EVENT LISTENERS =====

// Botones de acción rápida adicionales
btnDecrementar10.addEventListener("click", () => decrementar(10));
btnIncrementar10.addEventListener("click", () => incrementar(10));
btnSetToMin.addEventListener("click", setToMin);
btnSetToMax.addEventListener("click", setToMax);
btnSetToZero.addEventListener("click", setToZero);

// Controles de la aplicación
themeToggle.addEventListener("click", toggleTheme);
soundToggle.addEventListener("click", toggleSound);

// Historial
clearHistoryBtn.addEventListener("click", clearHistory);
toggleHistoryBtn.addEventListener("click", showHistoryModal);
modalCloseBtn.addEventListener("click", () => {
    historyModal.classList.remove("show");
    playSound("click");
});
exportHistoryBtn.addEventListener("click", exportHistoryToCSV);

// Cerrar modal al hacer clic fuera
historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) {
        historyModal.classList.remove("show");
        playSound("click");
    }
});

// Tamaño de paso
stepButtons.forEach(button => {
    button.addEventListener("click", (e) => setStepSize(parseInt(e.target.dataset.step)));
    if (parseInt(button.dataset.step) === stepSize) {
        button.classList.add("active");
    }
});

// ===== SOPORTE PARA TECLADO MEJORADO =====
document.addEventListener("keydown", (e) => {
    // Atajos originales
    switch (e.key) {
        case "ArrowUp":
            incrementar();
            e.preventDefault();
            break;
        case "ArrowDown":
            decrementar();
            e.preventDefault();
            break;
        case "r":
        case "R":
            resetear();
            e.preventDefault();
            break;
        case "+":
            incrementar(5);
            e.preventDefault();
            break;
        case "-":
            decrementar(5);
            e.preventDefault();
            break;
    }
    
    // Nuevos atajos
    switch (e.key.toLowerCase()) {
        case "t":
            toggleTheme();
            e.preventDefault();
            break;
        case "s":
            toggleSound();
            e.preventDefault();
            break;
        case "h":
            showHistoryModal();
            e.preventDefault();
            break;
        case "0":
            setToZero();
            e.preventDefault();
            break;
        case "1":
            setStepSize(1);
            e.preventDefault();
            break;
        case "2":
            setStepSize(2);
            e.preventDefault();
            break;
        case "5":
            setStepSize(5);
            e.preventDefault();
            break;
        case "escape":
            if (historyModal.classList.contains("show")) {
                historyModal.classList.remove("show");
                e.preventDefault();
            }
            break;
        case "pageup":
            setToMax();
            e.preventDefault();
            break;
        case "pagedown":
            setToMin();
            e.preventDefault();
            break;
    }
});

// ===== INICIALIZACIÓN =====
function init() {
    // Cargar estadísticas guardadas
    const savedStats = localStorage.getItem("counterStats");
    if (savedStats) {
        statistics = JSON.parse(savedStats);
    } else {
        statistics.min = contador;
        statistics.max = contador;
    }
    
    // Aplicar tema guardado
    if (isDarkTheme) {
        document.body.classList.add("dark-theme");
        const icon = themeToggle.querySelector("i");
        icon.className = "fas fa-sun";
    }
    
    // Aplicar sonido guardado
    if (!soundEnabled) {
        const icon = soundToggle.querySelector("i");
        icon.className = "fas fa-volume-mute";
    }
    
    // Mostrar valor inicial
    actualizarDisplay();
    updateHistoryView();
    
    // Mostrar información en consola
    console.log("🎮 Contador Interactivo Mejorado iniciado");
    console.log("💡 Atajos de teclado disponibles:");
    console.log("  ↑ : Incrementar (+1)");
    console.log("  ↓ : Decrementar (-1)");
    console.log("  R : Resetear a 0");
    console.log("  + : +5");
    console.log("  - : -5");
    console.log("  T : Cambiar tema");
    console.log("  S : Activar/desactivar sonido");
    console.log("  H : Ver historial completo");
    console.log("  0 : Establecer a cero");
    console.log("  1,2,5 : Cambiar tamaño de paso");
    console.log("  PgUp : Ir al máximo");
    console.log("  PgDown : Ir al mínimo");
    console.log("  Esc : Cerrar modal");
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        showNotification("¡Contador listo! Usa los atajos de teclado para más opciones.", "info");
    }, 1000);
}

// Iniciar la aplicación
init();