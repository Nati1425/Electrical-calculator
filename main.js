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
        return isNaN(value) ? NaN : value;
    }

    // Improved number formatting
    function formatNumber(num, precision = 4) {
        if (isNaN(num) || num === null || !isFinite(num)) return '---';
        if (num === 0) return '0';

        // Determine the number of decimal places needed for the given precision
        let factor = Math.pow(10, precision);
        let tempNum = num * factor;
        let roundedTempNum = Math.round(tempNum);

        // Check if number is very small or very large for exponential notation
        if (Math.abs(roundedTempNum / factor) > 1e9 || (Math.abs(roundedTempNum / factor) < 1e-6 && roundedTempNum !== 0)) {
            return num.toExponential(Math.max(0, precision - 1));
        }

        // Normal formatting
        // Calculate number of decimals required based on magnitude and precision
        let integerDigits = Math.floor(Math.log10(Math.abs(num))) + 1;
        let decimalPlaces = Math.max(0, precision - integerDigits);
        decimalPlaces = Math.min(decimalPlaces, 6); // Cap max decimals for sanity

        let finalNum = parseFloat(num.toFixed(decimalPlaces)); // Use toFixed then parseFloat to remove trailing zeros
        return finalNum.toString();

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

        if (isNaN(P) || isNaN(V) || isNaN(PF) || isNaN(eff)) {
            displayMessage(dcResultMessageEl, 'Please enter valid numbers for P, V, PF, and Efficiency.', 'error'); return;
        }
        if (V <= 0) { displayMessage(dcResultMessageEl, 'Voltage (V) must be positive.', 'error'); return; }
        if (P < 0) { displayMessage(dcResultMessageEl, 'Power (P) cannot be negative.', 'error'); return; }
        if (PF <= 0 || PF > 1) { displayMessage(dcResultMessageEl, 'Power Factor (PF) must be between > 0 and ≤ 1.', 'error'); return; }
        if (eff <= 0 || eff > 1) { displayMessage(dcResultMessageEl, 'Efficiency (eff) must be between > 0 and ≤ 1.', 'error'); return; }

        try {
            let Ib = 0;
            const denominator = V * PF * eff;
            if (denominator === 0) throw new Error("Divisor (V*PF*eff) cannot be zero.");


            if (isThreePhase) {
                const denominator3Ph = SQRT3 * denominator;
                if (denominator3Ph === 0) throw new Error("Divisor (√3*V*PF*eff) cannot be zero.");
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
            if (!isNaN(V)) ohmVoltageInput.value = V;
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
                 calculatedI = (V === 0) ? 0 : P / V;
                 calculatedR = (P === 0 && V === 0) ? 0 : (P === 0 && V !== 0) ? Infinity : (V * V) / P;
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
                calculatedV = (I === 0) ? 0 : P / I;
                calculatedR = (I === 0) ? Infinity : P / (I * I);
                if(ohmVoltageInput) ohmVoltageInput.value = formatNumber(calculatedV);
                if(ohmResistanceInput) ohmResistanceInput.value = formatNumber(calculatedR);
                calculationPerformed = true;
            } else if (providedKeys.includes('R') && providedKeys.includes('P')) {
                if (R < 0) throw new Error("R cannot be negative.");
                if (P < 0) throw new Error("P cannot be negative.");
                if (R === 0 && P !== 0) throw new Error("Cannot have P ≠ 0 with R = 0.");
                calculatedV = Math.sqrt(P * R);
                calculatedI = (R === 0) ? Infinity : Math.sqrt(P / R);
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

     // --- Resistivity Calculation Logic ---
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
            rho = parseFloat(materialSelect.value);
        } else { rho = NaN; }

        const L = getFloatValue(lengthInput);
        const A_mm2 = getFloatValue(areaInput);

        if (isNaN(rho) || isNaN(L) || isNaN(A_mm2)) {
            displayMessage(resistivityResultEl, 'Please enter valid numbers for all fields.', 'error'); return;
        }
        if (L <= 0 || A_mm2 <= 0 || rho < 0) {
             displayMessage(resistivityResultEl, 'Length & Area must be positive. Resistivity cannot be negative.', 'error'); return;
        }

        try {
            const A_m2 = A_mm2 * 1e-6;
            if (A_m2 === 0) throw new Error("Area cannot be zero.");

            const calculatedR = (rho * L) / A_m2;
            if (!isFinite(calculatedR)) throw new Error("Calculation resulted in non-finite value.");

            if (calcResistanceInput) calcResistanceInput.value = formatNumber(calculatedR, 6);
            displayMessage(resistivityResultEl, `Wire Resistance: ${formatNumber(calculatedR, 6)} Ω`, 'success');

        } catch (error) {
            displayMessage(resistivityResultEl, `Error: ${error.message}`, 'error');
        }
    }


     // --- Three-Phase Calculation Logic ---
     function calculate3Phase() {
        clearMessage(phaseResultEl);
        if(powerKva3PhOutput) powerKva3PhOutput.value = '';

        const Vll = getFloatValue(voltage3PhInput);
        const Il = getFloatValue(current3PhInput);
        const pf = getFloatValue(pf3PhInput);
        const Pkw = getFloatValue(powerKw3PhInput);

        const inputs = { Vll, Il, pf, Pkw };
        const providedKeys = Object.keys(inputs).filter(k => !isNaN(inputs[k]));

        let isValidCombination = false;
        if (providedKeys.includes('Vll') && providedKeys.includes('Il')) isValidCombination = true;
        if (providedKeys.includes('Vll') && providedKeys.includes('Pkw') && providedKeys.includes('pf')) isValidCombination = true;
        if (providedKeys.includes('Il') && providedKeys.includes('Pkw') && providedKeys.includes('pf')) isValidCombination = true;
         // Allow calculation if V, I, P provided (to find PF)
         if (providedKeys.includes('Vll') && providedKeys.includes('Il') && providedKeys.includes('Pkw')) isValidCombination = true;


        if (providedKeys.length < 2 || !isValidCombination) {
            displayMessage(phaseResultEl, 'Enter sufficient valid combination: (V,I) or (V,I,PF) or (V,I,P) or (V,P,PF) or (I,P,PF)', 'error');
            return;
        }
         if (!isNaN(pf) && (pf < 0 || pf > 1)) { displayMessage(phaseResultEl, 'PF must be between 0 and 1.', 'error'); return; }
         if (!isNaN(Vll) && Vll <= 0) { displayMessage(phaseResultEl, 'Voltage must be positive.', 'error'); return; }
         if (!isNaN(Il) && Il < 0) { displayMessage(phaseResultEl, 'Current cannot be negative.', 'error'); return; }
         if (!isNaN(Pkw) && Pkw < 0) { displayMessage(phaseResultEl, 'Power (kW) cannot be negative.', 'error'); return; }


        try {
            let calculatedVll = Vll, calculatedIl = Il, calculatedPf = pf, calculatedPkw = Pkw, calculatedSkva;
            let baseMsg = "Calculation based on provided: " + providedKeys.join(', ') + ".";
            let calculatedFields = [];

            if (!isNaN(Vll) && !isNaN(Il)) {
                calculatedSkva = (SQRT3 * Vll * Il) / 1000;
                if(powerKva3PhOutput) powerKva3PhOutput.value = formatNumber(calculatedSkva);
                 if(!calculatedFields.includes('S')) calculatedFields.push('S');
            } else {
                calculatedSkva = NaN;
            }

            if (!isNaN(Vll) && !isNaN(Il) && !isNaN(pf)) { // Case: V, I, PF -> P
                calculatedPkw = calculatedSkva * pf;
                if(powerKw3PhInput && !providedKeys.includes('Pkw')) powerKw3PhInput.value = formatNumber(calculatedPkw);
                 if(!calculatedFields.includes('P')) calculatedFields.push('P');
            }
            else if (!isNaN(Vll) && !isNaN(Il) && !isNaN(Pkw)) { // Case: V, I, P -> PF
                 if (calculatedSkva === 0 && Pkw !== 0) throw new Error("Cannot have P ≠ 0 with S = 0.");
                 calculatedPf = (calculatedSkva === 0) ? 1 : Pkw / calculatedSkva;

                 if (calculatedPf > 1.005 || calculatedPf < -0.005) {
                    if(pf3PhInput && !providedKeys.includes('pf')) pf3PhInput.value = '';
                    throw new Error(`Calculated PF (${formatNumber(calculatedPf)}) invalid.`);
                 }
                 calculatedPf = Math.max(0, Math.min(1, calculatedPf));
                 if(pf3PhInput && !providedKeys.includes('pf')) pf3PhInput.value = formatNumber(calculatedPf, 2);
                  if(!calculatedFields.includes('PF')) calculatedFields.push('PF');
            }
            else if (!isNaN(Vll) && !isNaN(Pkw) && !isNaN(pf)) { // Case: V, P, PF -> I, S
                if (Vll === 0) throw new Error("V cannot be zero.");
                if (pf === 0 && Pkw !== 0) throw new Error("Cannot have P ≠ 0 with PF=0.");
                const denominator = SQRT3 * Vll * pf;
                calculatedIl = (denominator === 0) ? (Pkw === 0 ? 0 : Infinity) : (Pkw * 1000) / denominator;
                 if(current3PhInput && !providedKeys.includes('Il')) current3PhInput.value = formatNumber(calculatedIl);
                 calculatedSkva = (SQRT3 * Vll * calculatedIl) / 1000;
                 if(powerKva3PhOutput && !providedKeys.includes('Skva')) powerKva3PhOutput.value = formatNumber(calculatedSkva); // Use Skva as key? No, S.
                  if(!calculatedFields.includes('I')) calculatedFields.push('I');
                  if(!calculatedFields.includes('S')) calculatedFields.push('S');
            }
            else if (!isNaN(Il) && !isNaN(Pkw) && !isNaN(pf)) { // Case: I, P, PF -> V, S
                 if (Il === 0 && Pkw !== 0) throw new Error("I cannot be zero if P ≠ 0.");
                 if (pf === 0 && Pkw !== 0) throw new Error("Cannot have P ≠ 0 with PF=0.");
                 const denominator = SQRT3 * Il * pf;
                 calculatedVll = (denominator === 0) ? (Pkw === 0 ? 0 : Infinity) : (Pkw * 1000) / denominator;

                 if (!isFinite(calculatedVll)) {
                      if(voltage3PhInput && !providedKeys.includes('Vll')) voltage3PhInput.value = '';
                     throw new Error("Cannot determine finite voltage.");
                 } else {
                     if(voltage3PhInput && !providedKeys.includes('Vll')) voltage3PhInput.value = formatNumber(calculatedVll);
                     calculatedSkva = (SQRT3 * calculatedVll * Il) / 1000;
                     if(powerKva3PhOutput && !providedKeys.includes('Skva')) powerKva3PhOutput.value = formatNumber(calculatedSkva);
                      if(!calculatedFields.includes('V')) calculatedFields.push('V');
                      if(!calculatedFields.includes('S')) calculatedFields.push('S');
                 }
            }

             if(calculatedFields.length > 0) {
                displayMessage(phaseResultEl, `Calculation complete. ${baseMsg}`, 'success');
             } else if (providedKeys.includes('Vll') && providedKeys.includes('Il')) {
                  displayMessage(phaseResultEl, `Apparent Power (S) calculated. Need PF or P(kW) for other values. ${baseMsg}`, 'success'); // Specific message if only S calculated
             }
              else {
                 displayMessage(phaseResultEl, `Could not calculate missing values with provided inputs. ${baseMsg}`, 'error');
             }

        } catch (error) {
            displayMessage(phaseResultEl, `Calculation Error: ${error.message}`, 'error');
             // Clear only fields that were NOT provided by user
             if (powerKva3PhOutput && !calculatedFields.includes('S')) powerKva3PhOutput.value = '';
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
             if (vd_percent > 5) {
                 vdRecommendation = `Warning: VD (${formatNumber(vd_percent, 2)}%) significantly high (>5%). Check calculation & consider larger wire size.`;
             } else if (vd_percent > EBCS_VD_LIMIT) {
                 vdRecommendation = `Warning: VD (${formatNumber(vd_percent, 2)}%) exceeds the EBCS limit of ${EBCS_VD_LIMIT}%. Consider larger wire size.`;
             } else if (vd_percent > 0) {
                vdRecommendation = `Voltage Drop (${formatNumber(vd_percent, 2)}%) is within the EBCS limit of ${EBCS_VD_LIMIT}%.`;
             } else {
                 vdRecommendation = "Voltage drop calculated as zero or negligible.";
             }

             displayMessage(vdResultEl, vdRecommendation, vd_percent > EBCS_VD_LIMIT ? 'error' : 'success');

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
        if(materialSelect) materialSelect.dispatchEvent(new Event('change'));
    }

     function clear3PhaseFields() {
        if(voltage3PhInput) voltage3PhInput.value = '380';
        if(current3PhInput) current3PhInput.value = '';
        if(pf3PhInput) pf3PhInput.value = '';
        if(powerKw3PhInput) powerKw3PhInput.value = '';
        if(powerKva3PhOutput) powerKva3PhOutput.value = '';
        clearMessage(phaseResultEl);
    }

    function clearVDFields() {
        if(vdMethodMvamRadio) vdMethodMvamRadio.checked = true;
        toggleVDMethodInputs(); // Resets visibility and clears messages/outputs

         if(vdMvamValInput) vdMvamValInput.value = '';
         if(vdMvamIbInput) vdMvamIbInput.value = '';
         if(vdMvamLengthInput) vdMvamLengthInput.value = '';
         if(vdMvamVoltageInput) vdMvamVoltageInput.value = '';

        if(vdApproxPhaseSelect) vdApproxPhaseSelect.selectedIndex = 0;
        if(vdApproxMaterialSelect) vdApproxMaterialSelect.selectedIndex = 0;
        if(vdApproxVoltageInput) vdApproxVoltageInput.value = '';
        if(vdApproxCurrentInput) vdApproxCurrentInput.value = '';
        if(vdApproxLengthInput) vdApproxLengthInput.value = '';
        if(vdApproxAreaInput) vdApproxAreaInput.value = '';
    }


    // --- Event Listeners ---
    // Add checks before adding listeners
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

     // Recalculate on Enter key press
     tabContents.forEach(tab => {
        tab.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && event.target.tagName === 'INPUT' && event.target.type !== 'radio' && event.target.type !== 'checkbox') {
                 const calcButton = tab.querySelector('.calc-button');
                 if (calcButton) {
                     event.preventDefault();
                     calcButton.click();
                 }
            }
        });
     });

}); // End DOMContentLoaded('Hello World!');
