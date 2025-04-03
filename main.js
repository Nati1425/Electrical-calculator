document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & Constants ---
    const SQRT3 = Math.sqrt(3); // Cache square root of 3
    const EBCS_VD_LIMIT = 4.0; // Ethiopian Standard Max VD % - UPDATED TO 4%

    // --- Get DOM Elements ---
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Design Current (Ib)
    const dcPowerInput = document.getElementById('dc_power');
    const dcVoltageInput = document.getElementById('dc_voltage');
    const dcPfInput = document.getElementById('dc_pf');
    const dcEffInput = document.getElementById('dc_eff');
    const dcSinglePhaseRadio = document.getElementById('dc_single_phase');
    const dcThreePhaseRadio = document.getElementById('dc_three_phase');
    const dcResultOutput = document.getElementById('dc_result');
    const dcCalculateBtn = document.getElementById('dc_calculateBtn');
    const dcClearBtn = document.getElementById('dc_clearBtn');
    const dcResultMessageEl = document.getElementById('dcResultMessage');

    // Ohm's Law
    const ohmVoltageInput = document.getElementById('ohm-voltage');
    const ohmCurrentInput = document.getElementById('ohm-current');
    const ohmResistanceInput = document.getElementById('ohm-resistance');
    const ohmPowerInput = document.getElementById('ohm-power');
    const calculateOhmBtn = document.getElementById('calculateOhm');
    const clearOhmBtn = document.getElementById('clearOhm');
    const ohmResultEl = document.getElementById('ohmResult');

    // Resistivity (Wire Resistance) - THIS SECTION HANDLES RESISTIVITY
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
    const vdMethodMvamRadio = document.getElementById('vd_method_mvam');
    const vdMethodApproxRadio = document.getElementById('vd_method_approx');
    const vdMvamInputsDiv = document.getElementById('vd_mvam_inputs');
    const vdApproxInputsDiv = document.getElementById('vd_approx_inputs');
    const vdMvamValInput = document.getElementById('vd_mvam_val');
    const vdMvamIbInput = document.getElementById('vd_mvam_ib');
    const vdMvamLengthInput = document.getElementById('vd_mvam_length');
    const vdMvamVoltageInput = document.getElementById('vd_mvam_voltage');
    const vdApproxPhaseSelect = document.getElementById('vd_approx_phase');
    const vdApproxMaterialSelect = document.getElementById('vd_approx_material');
    const vdApproxVoltageInput = document.getElementById('vd_approx_voltage');
    const vdApproxCurrentInput = document.getElementById('vd_approx_current');
    const vdApproxLengthInput = document.getElementById('vd_approx_length');
    const vdApproxAreaInput = document.getElementById('vd_approx_area'); // Area in mm²
    const vdDropVoltsOutput = document.getElementById('vd_drop_volts'); // Output
    const vdDropPercentOutput = document.getElementById('vd_drop_percent'); // Output
    const calculateVDBtn = document.getElementById('calculateVD');
    const clearVDBtn = document.getElementById('clearVD');
    const vdResultEl = document.getElementById('vdResult');

    // Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();


    // --- Helper Functions ---
    function displayMessage(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.className = `result-message ${type}`;
        element.style.display = 'block';
    }

    function clearMessage(element) {
        if (!element) return;
        element.textContent = '';
        element.className = 'result-message';
        element.style.display = 'none';
    }

    function getFloatValue(element) {
        if (!element || element.value.trim() === '') return NaN; // Handle empty string explicitly
        const value = parseFloat(element.value);
        // Check explicitly for NaN after parseFloat, as it can parse "Infinity"
        return isNaN(value) ? NaN : value;
    }


    // Improved number formatting for clarity and precision control
    function formatNumber(num, precision = 4) {
        if (isNaN(num) || num === null || !isFinite(num)) return '---'; // Handles NaN, null, Infinity
        if (num === 0) return '0';

        const absNum = Math.abs(num);

        // Use exponential notation for very large or very small numbers
        if (absNum >= 1e9 || (absNum < 1e-6 && absNum !== 0)) {
            // Adjust precision for exponential to show roughly 'precision' significant figures
            return num.toExponential(Math.max(0, precision - 1));
        }

        // Determine decimal places based on magnitude for standard notation
        let decimalPlaces;
        if (absNum >= 1) {
            // Calculate significant digits needed after decimal
            const integerDigits = Math.floor(Math.log10(absNum)) + 1;
            decimalPlaces = Math.max(0, precision - integerDigits);
        } else {
            // For numbers < 1, precision determines total significant digits
            // Count leading zeros after decimal point
            const leadingZeros = -Math.floor(Math.log10(absNum)) - 1;
            decimalPlaces = leadingZeros + precision;
        }

        // Limit total decimal places shown (e.g., max 6)
        decimalPlaces = Math.min(decimalPlaces, 6);

        // Use toFixed and then parseFloat to remove unnecessary trailing zeros
        let formatted = parseFloat(num.toFixed(decimalPlaces));
        return formatted.toString();
    }


    // --- Tab Switching Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            const targetContent = document.getElementById(targetTab);

            if (!targetContent) return;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            targetContent.classList.add('active');
        });
    });

    // --- Design Current (Ib) Calculation Logic ---
    function calculateDesignCurrent() {
        clearMessage(dcResultMessageEl);
        if(dcResultOutput) dcResultOutput.value = '';

        const P = getFloatValue(dcPowerInput);
        const V = getFloatValue(dcVoltageInput);
        const PF = getFloatValue(dcPfInput);
        const eff = getFloatValue(dcEffInput);
        const isThreePhase = dcThreePhaseRadio && dcThreePhaseRadio.checked;

        if (isNaN(P) || isNaN(V) || isNaN(PF) || isNaN(eff)) { displayMessage(dcResultMessageEl, 'Please enter valid numbers for P, V, PF, and Efficiency.', 'error'); return; }
        if (V <= 0) { displayMessage(dcResultMessageEl, 'Voltage (V) must be positive.', 'error'); return; }
        if (P < 0) { displayMessage(dcResultMessageEl, 'Power (P) cannot be negative.', 'error'); return; }
        if (PF <= 0 || PF > 1) { displayMessage(dcResultMessageEl, 'Power Factor (PF) must be > 0 and ≤ 1.', 'error'); return; }
        if (eff <= 0 || eff > 1) { displayMessage(dcResultMessageEl, 'Efficiency (eff) must be > 0 and ≤ 1.', 'error'); return; }

        try {
            let Ib = 0;
            const denominator = V * PF * eff;
            if (denominator === 0) throw new Error("Divisor (V×PF×eff) cannot be zero.");

            if (isThreePhase) {
                const denominator3Ph = SQRT3 * denominator;
                if (denominator3Ph === 0) throw new Error("Divisor (√3×V×PF×eff) cannot be zero.");
                Ib = P / denominator3Ph;
            } else {
                Ib = P / denominator;
            }

            if (!isFinite(Ib)) throw new Error("Calculation resulted in a non-finite value.");

            if(dcResultOutput) dcResultOutput.value = formatNumber(Ib, 4);
            displayMessage(dcResultMessageEl, `Design Current (Ib): ${formatNumber(Ib, 4)} A`, 'success');

        } catch (error) {
            displayMessage(dcResultMessageEl, `Calculation Error: ${error.message}`, 'error');
        }
    }

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
            clearOhmFields();
            if (!isNaN(V)) ohmVoltageInput.value = V; // Restore valid user input
            if (!isNaN(I)) ohmCurrentInput.value = I;
            if (!isNaN(R)) ohmResistanceInput.value = R;
            if (!isNaN(P)) ohmPowerInput.value = P;
            return;
        }

        try {
            let calculatedV = V, calculatedI = I, calculatedR = R, calculatedP = P;
            let calculationPerformed = false;

            const clearCalculated = () => {
                if (!providedKeys.includes('V') && ohmVoltageInput) ohmVoltageInput.value = '';
                if (!providedKeys.includes('I') && ohmCurrentInput) ohmCurrentInput.value = '';
                if (!providedKeys.includes('R') && ohmResistanceInput) ohmResistanceInput.value = '';
                if (!providedKeys.includes('P') && ohmPowerInput) ohmPowerInput.value = '';
            };

            if (providedKeys.includes('V') && providedKeys.includes('I')) {
                if (I === 0 && V !== 0) throw new Error("I cannot be 0 if V ≠ 0.");
                calculatedR = (I === 0) ? Infinity : V / I;
                calculatedP = V * I;
                if(ohmResistanceInput) ohmResistanceInput.value = formatNumber(calculatedR);
                if(ohmPowerInput) ohmPowerInput.value = formatNumber(calculatedP);
                calculationPerformed = true;
            } else if (providedKeys.includes('V') && providedKeys.includes('R')) {
                 if (R < 0) throw new Error("R cannot be negative.");
                 if (R === 0 && V !== 0) throw new Error("R cannot be 0 if V ≠ 0.");
                 calculatedI = (R === 0) ? Infinity : V / R;
                 calculatedP = (R === 0) ? Infinity : (V * V) / R;
                 if(ohmCurrentInput) ohmCurrentInput.value = formatNumber(calculatedI);
                 if(ohmPowerInput) ohmPowerInput.value = formatNumber(calculatedP);
                 calculationPerformed = true;
            } else if (providedKeys.includes('V') && providedKeys.includes('P')) {
                 if (V === 0 && P !== 0) throw new Error("V cannot be 0 if P ≠ 0.");
                 if (P < 0) throw new Error("P cannot be negative.");
                 calculatedI = (V === 0) ? (P === 0 ? 0 : Infinity) : P / V; // If V=0, I=0 only if P=0
                 calculatedR = (P === 0) ? (V === 0 ? 0 : Infinity) : (V * V) / P; // If P=0, R=0 only if V=0
                 if(ohmCurrentInput) ohmCurrentInput.value = formatNumber(calculatedI);
                 if(ohmResistanceInput) ohmResistanceInput.value = formatNumber(calculatedR);
                 calculationPerformed = true;
            } else if (providedKeys.includes('I') && providedKeys.includes('R')) {
                 if (R < 0) throw new Error("R cannot be negative.");
                calculatedV = I * R;
                calculatedP = I * I * R;
                if(ohmVoltageInput) ohmVoltageInput.value = formatNumber(calculatedV);
                if(ohmPowerInput) ohmPowerInput.value = formatNumber(calculatedP);
                calculationPerformed = true;
            } else if (providedKeys.includes('I') && providedKeys.includes('P')) {
                if (I === 0 && P !== 0) throw new Error("I cannot be 0 if P ≠ 0.");
                 if (P < 0) throw new Error("P cannot be negative.");
                calculatedV = (I === 0) ? 0 : P / I; // If I=0, V=0 (assuming P must also be 0)
                calculatedR = (I === 0) ? (P === 0 ? 0 : Infinity) : P / (I * I); // If I=0, R=0 only if P=0
                if(ohmVoltageInput) ohmVoltageInput.value = formatNumber(calculatedV);
                if(ohmResistanceInput) ohmResistanceInput.value = formatNumber(calculatedR);
                calculationPerformed = true;
            } else if (providedKeys.includes('R') && providedKeys.includes('P')) {
                if (R < 0) throw new Error("R cannot be negative.");
                if (P < 0) throw new Error("P cannot be negative.");
                if (R === 0 && P !== 0) throw new Error("Cannot have P ≠ 0 with R = 0.");
                calculatedV = Math.sqrt(P * R);
                calculatedI = (R === 0) ? Infinity : Math.sqrt(P / R); // If R=0, I=Inf (assuming P must be 0)
                if(ohmVoltageInput) ohmVoltageInput.value = formatNumber(calculatedV);
                if(ohmCurrentInput) ohmCurrentInput.value = formatNumber(calculatedI);
                calculationPerformed = true;
            }

            if (calculationPerformed) {
                displayMessage(ohmResultEl, 'Calculation complete!', 'success');
            } else {
                clearCalculated();
                displayMessage(ohmResultEl, 'Could not perform calculation with the provided inputs.', 'error');
            }

        } catch (error) {
            clearCalculated();
            displayMessage(ohmResultEl, `Calculation Error: ${error.message}`, 'error');
        }
    }

    // --- Resistivity (Wire Resistance) Calculation Logic ---
    if (materialSelect) {
        materialSelect.addEventListener('change', () => {
            if (materialSelect.value === 'custom') {
                if(resistivityCustomLabel) resistivityCustomLabel.style.display = 'block';
                if(resistivityCustomInput) resistivityCustomInput.style.display = 'block';
                if(resistivityCustomInput) resistivityCustomInput.focus();
            } else {
                 if(resistivityCustomLabel) resistivityCustomLabel.style.display = 'none';
                 if(resistivityCustomInput) resistivityCustomInput.style.display = 'none';
                 if(resistivityCustomInput) resistivityCustomInput.value = '';
            }
        });
    }

    function calculateResistanceFromResistivity() {
        clearMessage(resistivityResultEl);
        if (calcResistanceInput) calcResistanceInput.value = '';

        let rho;
        if (materialSelect && materialSelect.value === 'custom') {
            rho = getFloatValue(resistivityCustomInput);
        } else if (materialSelect) {
            rho = parseFloat(materialSelect.value); // Already validated as number in HTML options
        } else { rho = NaN; }

        const L = getFloatValue(lengthInput);
        const A_mm2 = getFloatValue(areaInput);

        if (isNaN(rho) || isNaN(L) || isNaN(A_mm2)) { displayMessage(resistivityResultEl, 'Please enter valid numbers for all fields.', 'error'); return; }
        if (L <= 0 || A_mm2 <= 0 || rho < 0) { displayMessage(resistivityResultEl, 'Length & Area must be positive. Resistivity cannot be negative.', 'error'); return; }

        try {
            const A_m2 = A_mm2 * 1e-6;
            if (A_m2 === 0) throw new Error("Area cannot be zero.");

            const calculatedR = (rho * L) / A_m2;
            if (!isFinite(calculatedR)) throw new Error("Calculation resulted in non-finite value.");

            if (calcResistanceInput) calcResistanceInput.value = formatNumber(calculatedR, 6); // Higher precision for resistance
            displayMessage(resistivityResultEl, `Wire Resistance: ${formatNumber(calculatedR, 6)} Ω`, 'success');

        } catch (error) {
            displayMessage(resistivityResultEl, `Error: ${error.message}`, 'error');
        }
    }


     // --- Three-Phase Calculation Logic ---
     function calculate3Phase() {
        clearMessage(phaseResultEl);
        if(powerKva3PhOutput) powerKva3PhOutput.value = ''; // Clear output always

        const Vll = getFloatValue(voltage3PhInput);
        const Il = getFloatValue(current3PhInput);
        const pf = getFloatValue(pf3PhInput);
        const Pkw = getFloatValue(powerKw3PhInput);

        const inputs = { Vll, Il, pf, Pkw };
        const providedKeys = Object.keys(inputs).filter(k => !isNaN(inputs[k]));

        // Validation: Need enough info to solve. At least 2 values needed, but specific combinations are required.
        let canCalculate = false;
        if (providedKeys.includes('Vll') && providedKeys.includes('Il')) canCalculate = true; // Can find S
        if (providedKeys.includes('Vll') && providedKeys.includes('Pkw') && providedKeys.includes('pf')) canCalculate = true; // Can find I, S
        if (providedKeys.includes('Il') && providedKeys.includes('Pkw') && providedKeys.includes('pf')) canCalculate = true; // Can find V, S
        // Allow V, I, P to find PF and S
        if (providedKeys.includes('Vll') && providedKeys.includes('Il') && providedKeys.includes('Pkw')) canCalculate = true;
        // Allow V, I, PF to find P and S
        if (providedKeys.includes('Vll') && providedKeys.includes('Il') && providedKeys.includes('pf')) canCalculate = true;


        if (providedKeys.length < 2 || !canCalculate) {
            displayMessage(phaseResultEl, 'Enter sufficient valid combination: e.g., (V,I) or (V,P,PF) or (I,P,PF) etc.', 'error');
            return;
        }
         // Input constraints
         if (!isNaN(pf) && (pf < 0 || pf > 1)) { displayMessage(phaseResultEl, 'PF must be between 0 and 1.', 'error'); return; }
         if (!isNaN(Vll) && Vll <= 0) { displayMessage(phaseResultEl, 'Voltage must be positive.', 'error'); return; }
         if (!isNaN(Il) && Il < 0) { displayMessage(phaseResultEl, 'Current cannot be negative.', 'error'); return; }
         if (!isNaN(Pkw) && Pkw < 0) { displayMessage(phaseResultEl, 'Power (kW) cannot be negative.', 'error'); return; }

        try {
            let calculatedVll = Vll, calculatedIl = Il, calculatedPf = pf, calculatedPkw = Pkw, calculatedSkva = NaN;
            let calculatedFields = []; // Track which fields were calculated

            // Helper to set value and track calculation
            const setCalculatedValue = (element, value, fieldKey) => {
                if (element && !providedKeys.includes(fieldKey)) { // Only set if not provided by user
                    element.value = formatNumber(value, (fieldKey === 'pf' ? 2 : 4)); // Less precision for PF
                    if(!calculatedFields.includes(fieldKey)) calculatedFields.push(fieldKey);
                }
                return value; // Return the calculated value
            };

             // 1. Calculate S if V & I are known
            if (!isNaN(Vll) && !isNaN(Il)) {
                calculatedSkva = setCalculatedValue(powerKva3PhOutput, (SQRT3 * Vll * Il) / 1000, 'S'); // Use 'S' as key
            }

            // 2. Calculate based on combinations
             if (!isNaN(Vll) && !isNaN(Il) && !isNaN(pf)) { // V, I, PF -> P, S
                calculatedSkva = setCalculatedValue(powerKva3PhOutput, (SQRT3 * Vll * Il) / 1000, 'S');
                calculatedPkw = setCalculatedValue(powerKw3PhInput, calculatedSkva * pf, 'Pkw');
            }
            else if (!isNaN(Vll) && !isNaN(Il) && !isNaN(Pkw)) { // V, I, P -> PF, S
                 calculatedSkva = setCalculatedValue(powerKva3PhOutput, (SQRT3 * Vll * Il) / 1000, 'S');
                 if (calculatedSkva === 0 && Pkw !== 0) throw new Error("Cannot have P ≠ 0 with S = 0.");
                 let tempPf = (calculatedSkva === 0) ? 1 : Pkw / calculatedSkva;
                 if (tempPf > 1.005 || tempPf < -0.005) throw new Error(`Calculated PF (${formatNumber(tempPf)}) invalid.`);
                 calculatedPf = setCalculatedValue(pf3PhInput, Math.max(0, Math.min(1, tempPf)), 'pf');
            }
            else if (!isNaN(Vll) && !isNaN(Pkw) && !isNaN(pf)) { // V, P, PF -> I, S
                 if (Vll <= 0) throw new Error("V must be positive.");
                 if (pf === 0 && Pkw !== 0) throw new Error("Cannot have P ≠ 0 with PF=0.");
                 const denominator = SQRT3 * Vll * pf;
                 let tempIl = (denominator === 0) ? (Pkw === 0 ? 0 : Infinity) : (Pkw * 1000) / denominator;
                 calculatedIl = setCalculatedValue(current3PhInput, tempIl, 'Il');
                 calculatedSkva = setCalculatedValue(powerKva3PhOutput, (SQRT3 * Vll * calculatedIl) / 1000, 'S');
            }
            else if (!isNaN(Il) && !isNaN(Pkw) && !isNaN(pf)) { // I, P, PF -> V, S
                 if (Il < 0) throw new Error("I cannot be negative."); // Allow I=0 if P=0
                 if (pf === 0 && Pkw !== 0) throw new Error("Cannot have P ≠ 0 with PF=0.");
                 const denominator = SQRT3 * Il * pf;
                 let tempVll = (denominator === 0) ? (Pkw === 0 ? 0 : Infinity) : (Pkw * 1000) / denominator;
                 if (!isFinite(tempVll)) throw new Error("Cannot determine finite voltage.");
                 calculatedVll = setCalculatedValue(voltage3PhInput, tempVll, 'Vll');
                 calculatedSkva = setCalculatedValue(powerKva3PhOutput, (SQRT3 * calculatedVll * Il) / 1000, 'S');
            }
             // Case where only V, I provided (S calculated above)
             else if (!isNaN(Vll) && !isNaN(Il) && isNaN(pf) && isNaN(Pkw)) {
                 // S already calculated, nothing more to do
                  if(!calculatedFields.includes('S')) calculatedFields.push('S'); // Ensure S is marked if calculated
             }


             // Final Message
             if(calculatedFields.length > 0) {
                 let calcSummary = calculatedFields.join(', ');
                 // Ensure S is mentioned if it was calculated
                 if (powerKva3PhOutput && powerKva3PhOutput.value !== '' && !calculatedFields.includes('S')) {
                    calcSummary += (calcSummary ? ', S' : 'S');
                 }
                 displayMessage(phaseResultEl, `Calculated: ${calcSummary}. Based on provided: ${providedKeys.join(', ')}.`, 'success');
             } else if (providedKeys.length >= 2) {
                 displayMessage(phaseResultEl, `Provided values sufficient, but no missing values to calculate.`, 'success'); // Or maybe 'info' type?
             }
              else {
                 // Should be caught by initial validation, but as fallback:
                 displayMessage(phaseResultEl, `Could not calculate missing values. Provide more info.`, 'error');
             }

        } catch (error) {
            displayMessage(phaseResultEl, `Calculation Error: ${error.message}`, 'error');
             // Clear only fields that were NOT provided by user and failed calculation
             if (powerKva3PhOutput && !providedKeys.includes('Skva')) powerKva3PhOutput.value = ''; // Assuming 'S' is the key used internally
             if (powerKw3PhInput && !providedKeys.includes('Pkw')) powerKw3PhInput.value = '';
             if (pf3PhInput && !providedKeys.includes('pf')) pf3PhInput.value = '';
             if (current3PhInput && !providedKeys.includes('Il')) current3PhInput.value = '';
             if (voltage3PhInput && !providedKeys.includes('Vll')) voltage3PhInput.value = '';
        }
     }


    // --- Voltage Drop Calculation Logic ---
    function toggleVDMethodInputs() {
        if (vdMethodMvamRadio && vdMethodApproxRadio) {
            if (vdMethodMvamRadio.checked) {
                if(vdMvamInputsDiv) vdMvamInputsDiv.style.display = 'block';
                if(vdApproxInputsDiv) vdApproxInputsDiv.style.display = 'none';
            } else {
                if(vdMvamInputsDiv) vdMvamInputsDiv.style.display = 'none';
                if(vdApproxInputsDiv) vdApproxInputsDiv.style.display = 'block';
            }
        }
         clearMessage(vdResultEl);
         if(vdDropVoltsOutput) vdDropVoltsOutput.value = '';
         if(vdDropPercentOutput) vdDropPercentOutput.value = '';
    }

    if (vdMethodMvamRadio) vdMethodMvamRadio.addEventListener('change', toggleVDMethodInputs);
    if (vdMethodApproxRadio) vdMethodApproxRadio.addEventListener('change', toggleVDMethodInputs);
    toggleVDMethodInputs(); // Initial call


    function calculateVoltageDrop() {
        clearMessage(vdResultEl);
        if(vdDropVoltsOutput) vdDropVoltsOutput.value = '';
        if(vdDropPercentOutput) vdDropPercentOutput.value = '';

        let vd_volts = NaN, vd_percent = NaN, Vsys = NaN;

        try {
             // --- mV/A/m method ---
            if (vdMethodMvamRadio && vdMethodMvamRadio.checked) {
                const mvam = getFloatValue(vdMvamValInput);
                const Ib = getFloatValue(vdMvamIbInput);
                const L = getFloatValue(vdMvamLengthInput);
                Vsys = getFloatValue(vdMvamVoltageInput);

                if (isNaN(mvam) || isNaN(Ib) || isNaN(L) || isNaN(Vsys)) throw new Error('mV/A/m Method: Enter valid numbers for all fields.');
                if (mvam < 0 || Ib < 0 || L <= 0 || Vsys <= 0) throw new Error('mV/A/m Method: Inputs must be non-negative (L, Vsys > 0).');

                vd_volts = (mvam * Ib * L) / 1000;
                vd_percent = (Vsys !== 0) ? (vd_volts / Vsys) * 100 : Infinity;
            }
            // --- Approx. Resistance method ---
            else if (vdMethodApproxRadio && vdMethodApproxRadio.checked) {
                const phase = parseInt(vdApproxPhaseSelect ? vdApproxPhaseSelect.value : 'NaN', 10);
                const rho = parseFloat(vdApproxMaterialSelect ? vdApproxMaterialSelect.value : 'NaN');
                Vsys = getFloatValue(vdApproxVoltageInput);
                const Iload = getFloatValue(vdApproxCurrentInput);
                const L = getFloatValue(vdApproxLengthInput);
                const A_mm2 = getFloatValue(vdApproxAreaInput);

                if (isNaN(phase) || isNaN(rho) || isNaN(Vsys) || isNaN(Iload) || isNaN(L) || isNaN(A_mm2)) throw new Error('Approx. Method: Enter valid numbers for all fields.');
                if (Vsys <= 0 || Iload < 0 || L <= 0 || A_mm2 <= 0 || rho < 0) throw new Error('Approx. Method: Inputs must be non-negative (Vsys, L, Area > 0).');

                const A_m2 = A_mm2 * 1e-6;
                if (A_m2 === 0) throw new Error("Approx. Method: Area cannot be zero.");

                const R_wire = (rho * L) / A_m2;
                if (!isFinite(R_wire)) throw new Error("Approx. Method: Calculated wire resistance is non-finite.");


                if (phase === 1) { vd_volts = 2 * Iload * R_wire; }
                else if (phase === 3) { vd_volts = SQRT3 * Iload * R_wire; }
                else { throw new Error("Approx. Method: Invalid phase selection."); }

                vd_percent = (Vsys !== 0) ? (vd_volts / Vsys) * 100 : Infinity;
            }
             else { throw new Error("No valid calculation method selected."); }

            // --- Display Results ---
            if (isNaN(vd_volts) || !isFinite(vd_volts) || isNaN(vd_percent) || !isFinite(vd_percent)) {
                 throw new Error("Calculation resulted in invalid/non-finite value.");
             }

            if(vdDropVoltsOutput) vdDropVoltsOutput.value = formatNumber(vd_volts, 3);
            if(vdDropPercentOutput) vdDropPercentOutput.value = formatNumber(vd_percent, 2) + " %";

             // --- Recommendations ---
             let vdRecommendation = "";
             // EBCS_VD_LIMIT is defined at the top as 4.0
             const HIGH_VD_WARN_LIMIT = 5.0; // General high VD warning

             if (vd_percent > HIGH_VD_WARN_LIMIT) {
                 vdRecommendation = `Warning: VD (${formatNumber(vd_percent, 2)}%) significantly high (> ${HIGH_VD_WARN_LIMIT}%). Check calculation & consider larger wire size/shorter run.`;
             } else if (vd_percent > EBCS_VD_LIMIT) {
                 vdRecommendation = `Warning: VD (${formatNumber(vd_percent, 2)}%) exceeds the EBCS limit of ${EBCS_VD_LIMIT}%. Consider larger wire size.`;
             } else if (vd_percent >= 0) { // Check >= 0 to handle 0% case
                vdRecommendation = `Voltage Drop (${formatNumber(vd_percent, 2)}%) is within the EBCS limit of ${EBCS_VD_LIMIT}%.`;
             } else {
                 // Should not happen with valid inputs, but handle negative VD case
                 vdRecommendation = "Calculated voltage drop is negative, check inputs.";
             }

             // Use error style if VD limit exceeded or calculation is problematic
             displayMessage(vdResultEl, vdRecommendation, (vd_percent > EBCS_VD_LIMIT || vd_percent < 0) ? 'error' : 'success');

         } catch (error) {
             displayMessage(vdResultEl, `Error: ${error.message}`, 'error');
              if(vdDropVoltsOutput) vdDropVoltsOutput.value = '';
              if(vdDropPercentOutput) vdDropPercentOutput.value = '';
         }
    }


    // --- Clear Functions ---
    function clearDesignCurrentFields() {
        if(dcPowerInput) dcPowerInput.value = '';
        if(dcVoltageInput) dcVoltageInput.value = '';
        if(dcPfInput) dcPfInput.value = '1.0';
        if(dcEffInput) dcEffInput.value = '1.0';
        if(dcSinglePhaseRadio) dcSinglePhaseRadio.checked = true;
        if(dcResultOutput) dcResultOutput.value = '';
        clearMessage(dcResultMessageEl);
    }

    function clearOhmFields() {
        if(ohmVoltageInput) ohmVoltageInput.value = '';
        if(ohmCurrentInput) ohmCurrentInput.value = '';
        if(ohmResistanceInput) ohmResistanceInput.value = '';
        if(ohmPowerInput) ohmPowerInput.value = '';
        clearMessage(ohmResultEl);
    }

    function clearResistivityFields() {
        if(materialSelect) materialSelect.selectedIndex = 0;
        if(resistivityCustomLabel) resistivityCustomLabel.style.display = 'none';
        if(resistivityCustomInput) resistivityCustomInput.style.display = 'none';
        if(resistivityCustomInput) resistivityCustomInput.value = '';
        if(lengthInput) lengthInput.value = '';
        if(areaInput) areaInput.value = '';
        if(calcResistanceInput) calcResistanceInput.value = '';
        clearMessage(resistivityResultEl);
        if(materialSelect) materialSelect.dispatchEvent(new Event('change')); // Ensure custom field hides
    }

     function clear3PhaseFields() {
        if(voltage3PhInput) voltage3PhInput.value = '380'; // Reset default
        if(current3PhInput) current3PhInput.value = '';
        if(pf3PhInput) pf3PhInput.value = '';
        if(powerKw3PhInput) powerKw3PhInput.value = '';
        if(powerKva3PhOutput) powerKva3PhOutput.value = '';
        clearMessage(phaseResultEl);
    }

    function clearVDFields() {
        if(vdMethodMvamRadio) vdMethodMvamRadio.checked = true; // Default to mV/A/m method
        toggleVDMethodInputs(); // Resets visibility and clears messages/outputs

         if(vdMvamValInput) vdMvamValInput.value = '';
         if(vdMvamIbInput) vdMvamIbInput.value = '';
         if(vdMvamLengthInput) vdMvamLengthInput.value = '';
         if(vdMvamVoltageInput) vdMvamVoltageInput.value = '';

        if(vdApproxPhaseSelect) vdApproxPhaseSelect.selectedIndex = 0; // Reset to Single Phase
        if(vdApproxMaterialSelect) vdApproxMaterialSelect.selectedIndex = 0; // Reset to Copper
        if(vdApproxVoltageInput) vdApproxVoltageInput.value = '';
        if(vdApproxCurrentInput) vdApproxCurrentInput.value = '';
        if(vdApproxLengthInput) vdApproxLengthInput.value = '';
        if(vdApproxAreaInput) vdApproxAreaInput.value = '';
    }


    // --- Event Listeners ---
    // Add checks before adding listeners for robustness
    if(dcCalculateBtn) dcCalculateBtn.addEventListener('click', calculateDesignCurrent);
    if(dcClearBtn) dcClearBtn.addEventListener('click', clearDesignCurrentFields);

    if(calculateOhmBtn) calculateOhmBtn.addEventListener('click', calculateOhm);
    if(clearOhmBtn) clearOhmBtn.addEventListener('click', clearOhmFields);

    if(calculateResistivityBtn) calculateResistivityBtn.addEventListener('click', calculateResistanceFromResistivity);
    if(clearResistivityBtn) clearResistivityBtn.addEventListener('click', clearResistivityFields);

    if(calculate3PhaseBtn) calculate3PhaseBtn.addEventListener('click', calculate3Phase);
    if(clear3PhaseBtn) clear3PhaseBtn.addEventListener('click', clear3PhaseFields);

    if(calculateVDBtn) calculateVDBtn.addEventListener('click', calculateVoltageDrop);
    if(clearVDBtn) clearVDBtn.addEventListener('click', clearVDFields);

     // Recalculate on Enter key press in relevant input fields
     document.querySelectorAll('.calculator-area input[type="number"]').forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                 // Find the parent tab content
                 const parentTab = input.closest('.tab-content');
                 if (parentTab) {
                     // Find the calculate button within that tab
                     const calcButton = parentTab.querySelector('.calc-button');
                     if (calcButton) {
                         event.preventDefault(); // Prevent default behavior (like form submission)
                         calcButton.click(); // Trigger the button click
                     }
                 }
            }
        });
     });

}); // End DOMContentLoaded('Hello World!');
