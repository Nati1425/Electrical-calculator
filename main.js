document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & Constants ---
    const SQRT3 = Math.sqrt(3); // Cache square root of 3

    // --- Get DOM Elements ---
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Ohm's Law
    const ohmVoltageInput = document.getElementById('ohm-voltage');
    const ohmCurrentInput = document.getElementById('ohm-current');
    const ohmResistanceInput = document.getElementById('ohm-resistance');
    const ohmPowerInput = document.getElementById('ohm-power');
    const calculateOhmBtn = document.getElementById('calculateOhm');
    const clearOhmBtn = document.getElementById('clearOhm');
    const ohmResultEl = document.getElementById('ohmResult');

    // Resistivity (Wire Resistance)
    const materialSelect = document.getElementById('material');
    const resistivityCustomLabel = document.getElementById('resistivity-custom-label');
    const resistivityCustomInput = document.getElementById('resistivity-custom');
    const lengthInput = document.getElementById('length');
    const areaInput = document.getElementById('area'); // Area in mm²
    const calcResistanceInput = document.getElementById('calcResistance'); // Output
    const calculateResistivityBtn = document.getElementById('calculateResistivity');
    const clearResistivityBtn = document.getElementById('clearResistivity');
    const resistivityResultEl = document.getElementById('resistivityResult');

    // Three Phase
    const voltage3PhInput = document.getElementById('3ph-voltage');
    const current3PhInput = document.getElementById('3ph-current');
    const pf3PhInput = document.getElementById('3ph-pf');
    const powerKw3PhInput = document.getElementById('3ph-power-kw');
    const powerKva3PhOutput = document.getElementById('3ph-power-kva'); // Output
    const calculate3PhaseBtn = document.getElementById('calculate3Phase');
    const clear3PhaseBtn = document.getElementById('clear3Phase');
    const phaseResultEl = document.getElementById('3phaseResult');

    // Voltage Drop
    const vdPhaseSelect = document.getElementById('vd-phase');
    const vdMaterialSelect = document.getElementById('vd-material');
    const vdVoltageInput = document.getElementById('vd-voltage');
    const vdCurrentInput = document.getElementById('vd-current');
    const vdLengthInput = document.getElementById('vd-length');
    const vdAreaInput = document.getElementById('vd-area'); // Area in mm²
    const vdDropVoltsOutput = document.getElementById('vd-drop-volts'); // Output
    const vdDropPercentOutput = document.getElementById('vd-drop-percent'); // Output
    const calculateVDBtn = document.getElementById('calculateVD');
    const clearVDBtn = document.getElementById('clearVD');
    const vdResultEl = document.getElementById('vdResult');

    // Footer Year
    const yearSpan = document.getElementById('year');
    yearSpan.textContent = new Date().getFullYear();


    // --- Helper Functions ---
    function displayMessage(element, message, type = 'error') {
        element.textContent = message;
        element.className = `result-message ${type}`; // Apply 'error' or 'success' class
        element.style.display = 'block';
        // Auto-clear message after some time? Maybe not, let user clear.
    }

    function clearMessage(element) {
        element.textContent = '';
        element.className = 'result-message';
        element.style.display = 'none';
    }

    // Safely get float value from input, return NaN if invalid/empty
    function getFloatValue(element) {
        const value = parseFloat(element.value);
        return isNaN(value) ? NaN : value;
    }

    function formatNumber(num, precision = 4) {
        if (isNaN(num) || num === null) return 'N/A';
        if (num === 0) return '0';

        // Use exponential for very small or very large numbers
        if (Math.abs(num) > 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(precision -1);
        }

        // Determine decimal places based on magnitude, aiming for 'precision' significant figures
        let factor = Math.pow(10, precision - 1 - Math.floor(Math.log10(Math.abs(num))));
        let rounded = Math.round(num * factor) / factor;

        // Avoid trailing zeros if integer, limit decimals otherwise
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(Math.min(precision, 5)); // Limit decimals overall
    }


    // --- Tab Switching Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Deactivate all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- Ohm's Law Calculation Logic ---
    function calculateOhm() {
        clearMessage(ohmResultEl);
        const V = getFloatValue(ohmVoltageInput);
        const I = getFloatValue(ohmCurrentInput);
        const R = getFloatValue(ohmResistanceInput);
        const P = getFloatValue(ohmPowerInput);

        const inputs = { V, I, R, P };
        const providedValues = Object.values(inputs).filter(v => !isNaN(v));
        const providedKeys = Object.keys(inputs).filter(k => !isNaN(inputs[k]));

        if (providedValues.length !== 2) {
            displayMessage(ohmResultEl, 'Please provide exactly two valid numerical values.', 'error');
            return;
        }

        try {
            let calculatedV = V, calculatedI = I, calculatedR = R, calculatedP = P;
            let calculationPerformed = false;

            if (providedKeys.includes('V') && providedKeys.includes('I')) {
                if (I === 0 && V !== 0) throw new Error("Current cannot be 0 if Voltage is non-zero.");
                calculatedR = (I === 0) ? Infinity : V / I; // Handle I=0 -> R=Infinity
                calculatedP = V * I;
                ohmResistanceInput.value = formatNumber(calculatedR);
                ohmPowerInput.value = formatNumber(calculatedP);
                calculationPerformed = true;
            } else if (providedKeys.includes('V') && providedKeys.includes('R')) {
                 if (R < 0) throw new Error("Resistance cannot be negative.");
                 if (R === 0 && V !== 0) throw new Error("Resistance cannot be 0 if Voltage is non-zero.");
                 calculatedI = (R === 0) ? Infinity : V / R;
                 calculatedP = (R === 0) ? Infinity : (V * V) / R;
                 ohmCurrentInput.value = formatNumber(calculatedI);
                 ohmPowerInput.value = formatNumber(calculatedP);
                 calculationPerformed = true;
            } else if (providedKeys.includes('V') && providedKeys.includes('P')) {
                 if (V === 0 && P !== 0) throw new Error("Voltage cannot be 0 if Power is non-zero.");
                 calculatedI = (V === 0) ? 0 : P / V; // Assume I=0 if V=0,P=0
                 calculatedR = (P === 0) ? 0 : (V * V) / P; // Assume R=0 if V=0,P=0 (careful!)
                 ohmCurrentInput.value = formatNumber(calculatedI);
                 ohmResistanceInput.value = formatNumber(calculatedR);
                 calculationPerformed = true;
            } else if (providedKeys.includes('I') && providedKeys.includes('R')) {
                 if (R < 0) throw new Error("Resistance cannot be negative.");
                calculatedV = I * R;
                calculatedP = I * I * R;
                ohmVoltageInput.value = formatNumber(calculatedV);
                ohmPowerInput.value = formatNumber(calculatedP);
                calculationPerformed = true;
            } else if (providedKeys.includes('I') && providedKeys.includes('P')) {
                if (I === 0 && P !== 0) throw new Error("Current cannot be 0 if Power is non-zero.");
                calculatedV = (I === 0) ? 0 : P / I; // Assume V=0 if I=0,P=0
                calculatedR = (I === 0) ? Infinity : P / (I * I); // Handle I=0 -> R=Infinity
                ohmVoltageInput.value = formatNumber(calculatedV);
                ohmResistanceInput.value = formatNumber(calculatedR);
                calculationPerformed = true;
            } else if (providedKeys.includes('R') && providedKeys.includes('P')) {
                if (R < 0) throw new Error("Resistance cannot be negative.");
                if (P < 0) throw new Error("Power cannot be negative.");
                if (R === 0 && P !== 0) throw new Error("Cannot have non-zero Power with zero Resistance.");
                calculatedV = Math.sqrt(P * R);
                calculatedI = (R === 0) ? Infinity : Math.sqrt(P / R);
                ohmVoltageInput.value = formatNumber(calculatedV);
                ohmCurrentInput.value = formatNumber(calculatedI);
                calculationPerformed = true;
            }

            if (calculationPerformed) {
                displayMessage(ohmResultEl, 'Calculation complete!', 'success');
            } else {
                displayMessage(ohmResultEl, 'Could not perform calculation with the provided inputs.', 'error');
            }

        } catch (error) {
            displayMessage(ohmResultEl, `Calculation Error: ${error.message}`, 'error');
            // Optionally clear calculated fields on error
            if (!providedKeys.includes('V')) ohmVoltageInput.value = '';
            if (!providedKeys.includes('I')) ohmCurrentInput.value = '';
            if (!providedKeys.includes('R')) ohmResistanceInput.value = '';
            if (!providedKeys.includes('P')) ohmPowerInput.value = '';
        }
    }

     // --- Resistivity Calculation Logic ---
    materialSelect.addEventListener('change', () => {
        if (materialSelect.value === 'custom') {
            resistivityCustomLabel.style.display = 'block';
            resistivityCustomInput.style.display = 'block';
            resistivityCustomInput.focus();
        } else {
            resistivityCustomLabel.style.display = 'none';
            resistivityCustomInput.style.display = 'none';
            resistivityCustomInput.value = ''; // Clear custom value
        }
    });

    function calculateResistanceFromResistivity() {
        clearMessage(resistivityResultEl);
        calcResistanceInput.value = ''; // Clear previous result

        let rho;
        if (materialSelect.value === 'custom') {
            rho = getFloatValue(resistivityCustomInput);
        } else {
            rho = parseFloat(materialSelect.value); // Value is the resistivity
        }

        const L = getFloatValue(lengthInput);       // Length (m)
        const A_mm2 = getFloatValue(areaInput);     // Area (mm²)

        if (isNaN(rho) || isNaN(L) || isNaN(A_mm2)) {
            displayMessage(resistivityResultEl, 'Please enter valid numbers for all fields.', 'error');
            return;
        }

        if (L <= 0 || A_mm2 <= 0 || rho < 0) {
             displayMessage(resistivityResultEl, 'Length & Area must be positive. Resistivity cannot be negative.', 'error');
             return;
        }

        try {
            // Convert Area from mm² to m² (1 mm² = 1e-6 m²)
            const A_m2 = A_mm2 * 1e-6;

            if (A_m2 === 0) {
                throw new Error("Area cannot be zero.");
            }

            const calculatedR = (rho * L) / A_m2;
            calcResistanceInput.value = formatNumber(calculatedR, 5); // More precision for resistance
             displayMessage(resistivityResultEl, `Wire Resistance: ${formatNumber(calculatedR, 5)} Ω`, 'success');

        } catch (error) {
            displayMessage(resistivityResultEl, `Error: ${error.message}`, 'error');
        }
    }


     // --- Three-Phase Calculation Logic ---
     function calculate3Phase() {
        clearMessage(phaseResultEl);
        powerKva3PhOutput.value = ''; // Clear previous result

        const Vll = getFloatValue(voltage3PhInput); // Line-to-Line Voltage
        const Il = getFloatValue(current3PhInput);   // Line Current
        const pf = getFloatValue(pf3PhInput);       // Power Factor
        const Pkw = getFloatValue(powerKw3PhInput); // Power in kW

        const inputs = { Vll, Il, pf, Pkw };
        const providedValues = Object.values(inputs).filter(v => !isNaN(v));

        if (providedValues.length < 2 || providedValues.length > 3) {
            displayMessage(phaseResultEl, 'Enter 2 or 3 values (V, I, PF or V, I, P or V, P, PF or I, P, PF) to calculate.', 'error');
            return;
        }
         if (!isNaN(pf) && (pf < 0 || pf > 1)) {
             displayMessage(phaseResultEl, 'Power Factor (PF) must be between 0 and 1.', 'error');
             return;
         }
         if (!isNaN(Vll) && Vll <= 0) displayMessage(phaseResultEl, 'Voltage must be positive.', 'error');
         if (!isNaN(Il) && Il < 0) displayMessage(phaseResultEl, 'Current cannot be negative.', 'error');
         if (!isNaN(Pkw) && Pkw < 0) displayMessage(phaseResultEl, 'Power (kW) cannot be negative.', 'error');


        try {
            let calculatedIl = Il, calculatedPf = pf, calculatedPkw = Pkw, calculatedSkva;
            let baseMsg = "Calculation based on: ";

            // Calculate S (kVA) first, as it's often useful
            if (!isNaN(Vll) && !isNaN(Il)) {
                calculatedSkva = (SQRT3 * Vll * Il) / 1000;
                powerKva3PhOutput.value = formatNumber(calculatedSkva);
            }

            // Case 1: V, I, PF given -> Calculate P(kW)
            if (!isNaN(Vll) && !isNaN(Il) && !isNaN(pf)) {
                calculatedPkw = (SQRT3 * Vll * Il * pf) / 1000;
                powerKw3PhInput.value = formatNumber(calculatedPkw);
                baseMsg += "V, I, PF.";
            }
            // Case 2: V, I, P(kW) given -> Calculate PF
            else if (!isNaN(Vll) && !isNaN(Il) && !isNaN(Pkw)) {
                 if (Vll === 0 || Il === 0) { // Avoid division by zero if V or I is 0
                     calculatedPf = (Pkw === 0) ? 1 : NaN; // PF is 1 if P=0, else undefined
                 } else {
                    calculatedSkva = (SQRT3 * Vll * Il) / 1000; // Recalculate S if needed
                    powerKva3PhOutput.value = formatNumber(calculatedSkva);
                     if(calculatedSkva === 0 && Pkw !== 0) throw new Error("Cannot have real power with zero apparent power.");
                    calculatedPf = (calculatedSkva === 0) ? 1 : Pkw / calculatedSkva; // PF is 1 if S=0 and P=0
                 }

                 if (calculatedPf > 1.005 || calculatedPf < 0) { // Allow for slight rounding errors
                    pf3PhInput.value = ''; // Clear invalid PF
                    throw new Error(`Calculated PF (${formatNumber(calculatedPf)}) is outside valid range [0, 1]. Check inputs.`);
                 }
                 calculatedPf = Math.max(0, Math.min(1, calculatedPf)); // Clamp to [0,1]
                 pf3PhInput.value = formatNumber(calculatedPf, 2);
                baseMsg += "V, I, P(kW).";
            }
            // Case 3: V, P(kW), PF given -> Calculate I
            else if (!isNaN(Vll) && !isNaN(Pkw) && !isNaN(pf)) {
                if (Vll === 0) throw new Error("Voltage cannot be zero for this calculation.");
                if (pf === 0 && Pkw !== 0) throw new Error("Cannot have real power with PF=0.");
                 calculatedIl = (pf === 0) ? 0 : (Pkw * 1000) / (SQRT3 * Vll * pf);
                 current3PhInput.value = formatNumber(calculatedIl);
                 // Recalculate S (kVA)
                 calculatedSkva = (SQRT3 * Vll * calculatedIl) / 1000;
                 powerKva3PhOutput.value = formatNumber(calculatedSkva);
                baseMsg += "V, P(kW), PF.";
            }
            // Case 4: I, P(kW), PF given -> Calculate V
            else if (!isNaN(Il) && !isNaN(Pkw) && !isNaN(pf)) {
                 if (Il === 0 && Pkw !== 0) throw new Error("Current cannot be zero if Power is non-zero.");
                 if (pf === 0 && Pkw !== 0) throw new Error("Cannot have real power with PF=0.");
                 // If I=0 and P=0, Voltage is indeterminate, but let's assume 0 for practical purposes.
                 // If I>0 and PF=0 and P=0, V could be anything. Let's avoid division by zero.
                 if (Il * pf === 0) {
                     calculatedVll = (Pkw === 0) ? 0 : NaN; // V is 0 if P=0, else indeterminate/error
                 } else {
                    calculatedVll = (Pkw * 1000) / (SQRT3 * Il * pf);
                 }

                if (isNaN(calculatedVll)) {
                     voltage3PhInput.value = '';
                     throw new Error("Cannot determine voltage with these inputs (likely I=0 or PF=0 while P=0).");
                 } else {
                     voltage3PhInput.value = formatNumber(calculatedVll);
                     // Recalculate S (kVA)
                     calculatedSkva = (SQRT3 * calculatedVll * Il) / 1000;
                     powerKva3PhOutput.value = formatNumber(calculatedSkva);
                     baseMsg += "I, P(kW), PF.";
                 }

            }
            else {
                 displayMessage(phaseResultEl, 'Insufficient or invalid combination of inputs provided.', 'error');
                return;
            }

            displayMessage(phaseResultEl, `Calculation complete. ${baseMsg}`, 'success');

        } catch (error) {
            displayMessage(phaseResultEl, `Calculation Error: ${error.message}`, 'error');
            // Clear outputs on error
             powerKva3PhOutput.value = '';
             // Maybe clear the calculated field too? Depends on preference.
             // e.g., if calculating PF failed, clear pf3PhInput.value
        }
     }


    // --- Voltage Drop Calculation Logic ---
    // Set default voltages based on phase selection
    vdPhaseSelect.addEventListener('change', () => {
        if (vdPhaseSelect.value === '1') {
            vdVoltageInput.placeholder = 'e.g., 220';
            // Optionally set value: vdVoltageInput.value = '220';
        } else {
            vdVoltageInput.placeholder = 'e.g., 380';
             // Optionally set value: vdVoltageInput.value = '380';
        }
    });

    function calculateVoltageDrop() {
        clearMessage(vdResultEl);
        vdDropVoltsOutput.value = '';
        vdDropPercentOutput.value = '';

        const phase = parseInt(vdPhaseSelect.value, 10); // 1 or 3
        const rho = parseFloat(vdMaterialSelect.value); // Resistivity (Ω·m) from selected material
        const Vsys = getFloatValue(vdVoltageInput);    // System Voltage (V)
        const Iload = getFloatValue(vdCurrentInput);   // Load Current (A)
        const L = getFloatValue(vdLengthInput);        // One-way Length (m)
        const A_mm2 = getFloatValue(vdAreaInput);      // Area (mm²)

        if (isNaN(phase) || isNaN(rho) || isNaN(Vsys) || isNaN(Iload) || isNaN(L) || isNaN(A_mm2)) {
            displayMessage(vdResultEl, 'Please enter valid numbers for all fields.', 'error');
            return;
        }

        if (Vsys <= 0 || Iload < 0 || L <= 0 || A_mm2 <= 0) {
            displayMessage(vdResultEl, 'Voltage, Length, Area must be positive. Current cannot be negative.', 'error');
            return;
        }

         try {
            // Convert Area from mm² to m²
            const A_m2 = A_mm2 * 1e-6;
            if (A_m2 === 0) throw new Error("Conductor area cannot be zero.");

            // Calculate resistance of ONE conductor
            const R_wire = (rho * L) / A_m2;

            let vd_volts;
            // Calculate Voltage Drop (Volts)
            if (phase === 1) {
                // Single Phase: VD = 2 * I * R (round trip)
                vd_volts = 2 * Iload * R_wire;
            } else {
                // Three Phase: VD (line-to-line) = √3 * I * R (approximate formula assumes balanced load, ignores reactance)
                vd_volts = SQRT3 * Iload * R_wire;
            }

            if (isNaN(vd_volts)) {
                throw new Error("Calculation resulted in an invalid value (NaN). Check inputs.");
            }

            // Calculate Percentage Voltage Drop
            const vd_percent = (vd_volts / Vsys) * 100;

            vdDropVoltsOutput.value = formatNumber(vd_volts, 3);
            vdDropPercentOutput.value = formatNumber(vd_percent, 2) + " %";

             let vdRecommendation = "";
             if(vd_percent > 5) {
                 vdRecommendation = " Warning: Voltage drop exceeds typical 5% limit for final circuits. Consider larger wire size.";
             } else if (vd_percent > 3) {
                 vdRecommendation = " Notice: Voltage drop exceeds typical 3% limit for feeders. Check requirements.";
             }

             displayMessage(vdResultEl, `Voltage Drop calculated.${vdRecommendation}`, 'success');

         } catch (error) {
             displayMessage(vdResultEl, `Error: ${error.message}`, 'error');
         }

    }


    // --- Clear Functions ---
    function clearOhmFields() {
        ohmVoltageInput.value = '';
        ohmCurrentInput.value = '';
        ohmResistanceInput.value = '';
        ohmPowerInput.value = '';
        clearMessage(ohmResultEl);
    }

    function clearResistivityFields() {
        materialSelect.selectedIndex = 0; // Reset to Copper
        resistivityCustomLabel.style.display = 'none';
        resistivityCustomInput.style.display = 'none';
        resistivityCustomInput.value = '';
        lengthInput.value = '';
        areaInput.value = '';
        calcResistanceInput.value = '';
        clearMessage(resistivityResultEl);
    }

     function clear3PhaseFields() {
        voltage3PhInput.value = '380'; // Reset default
        current3PhInput.value = '';
        pf3PhInput.value = '';
        powerKw3PhInput.value = '';
        powerKva3PhOutput.value = '';
        clearMessage(phaseResultEl);
    }

    function clearVDFields() {
        vdPhaseSelect.selectedIndex = 0; // Reset to Single Phase
        vdMaterialSelect.selectedIndex = 0; // Reset to Copper
        vdVoltageInput.value = ''; // Clear voltage as it depends on phase now
        vdVoltageInput.placeholder = 'e.g., 220';
        vdCurrentInput.value = '';
        vdLengthInput.value = '';
        vdAreaInput.value = '';
        vdDropVoltsOutput.value = '';
        vdDropPercentOutput.value = '';
        clearMessage(vdResultEl);
    }


    // --- Event Listeners ---
    calculateOhmBtn.addEventListener('click', calculateOhm);
    clearOhmBtn.addEventListener('click', clearOhmFields);

    calculateResistivityBtn.addEventListener('click', calculateResistanceFromResistivity);
    clearResistivityBtn.addEventListener('click', clearResistivityFields);

    calculate3PhaseBtn.addEventListener('click', calculate3Phase);
    clear3PhaseBtn.addEventListener('click', clear3PhaseFields);

    calculateVDBtn.addEventListener('click', calculateVoltageDrop);
    clearVDBtn.addEventListener('click', clearVDFields);

     // Optional: Recalculate on Enter key press within an input field of the active tab
     tabContents.forEach(tab => {
        tab.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
                 // Find the calculate button within this tab and click it
                 const calcButton = tab.querySelector('.calc-button');
                 if (calcButton) {
                     event.preventDefault(); // Prevent form submission if it were a form
                     calcButton.click();
                 }
            }
        });
     });


}); // End DOMContentLoadedconsole.log('Hello World!');
