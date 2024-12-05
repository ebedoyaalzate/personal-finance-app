// Importar bibliotecas necesarias
import * as XLSX from "xlsx"; // Biblioteca para leer archivos Excel
import * as fs from "fs";
import * as path from "path";

// Función para procesar el archivo y responder preguntas
export function processExcelFile() {
  try {
    const filePath = path.join(process.cwd(), "public", "Proyecto Volo.xlsx");

    console.log("Resolved file path:", filePath);
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("File does not exist at path:", filePath);
    } else {
      console.log("File exists and is accessible.");
    }

    // Read file as binary
    const fileBuffer = fs.readFileSync(filePath);

    // Parse workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const personalCashFlowSheet = workbook.Sheets["Flujo de Caja Personal"];

    // Convertir la hoja a un formato JSON para facilitar el análisis
    const cashFlowData = XLSX.utils.sheet_to_json(personalCashFlowSheet, {
      header: 1,
    });

    // Pregunta 1: ¿El flujo de caja en 2025 es positivo?
    const cashFlowAccumulatedRow = cashFlowData.find(
      (row) => row[0] === "Flujo de caja acumulado"
    );
    const cashFlow2025 = cashFlowAccumulatedRow?.slice(1, 13); // Columnas enero-diciembre de 2025
    const total2025 = cashFlow2025.reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      0
    );
    const question1 = total2025 > 0 ? "Positivo" : "Negativo";

    // Pregunta 2: Gráfica de torta
    const categories = [
      "Gastos Hogar",
      "Gastos Hormiga",
      "Gastos Generales",
      "Gastos Impuestos",
      "Gasto Creditos",
    ];
    const categoryData = cashFlowData.filter((row) =>
      categories.includes(row[0])
    );
    const categoryTotals = categoryData.map((row) => ({
      category: row[0],
      total: row
        .slice(1, 13)
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0),
    }));

    // Pregunta 3: WACC
    const creditsSheet = workbook.Sheets["Creditos"];
    const creditsData = XLSX.utils.sheet_to_json(creditsSheet);

    const totalDebt = creditsData.reduce(
      (sum, credit) => sum + credit.Monto,
      0
    );
    const weightedCost = creditsData.reduce(
      (sum, credit) => sum + credit.Monto * credit["Tasa ea"],
      0
    );

    const wacc = weightedCost / totalDebt;

    // Pregunta 4: Total de deudas y costo anual de intereses

    const annualInterest = creditsData.reduce(
      (sum, credit) => sum + credit.Monto * credit["Tasa ea"],
      0
    );

    // Pregunta 5: Plan de abonos
    // Implementar lógica de abonos con reserva del 3%

    console.log("cashFlowAccumulatedRow", cashFlowAccumulatedRow);

    // Pregunta 6: Proyección de flujo de caja a diciembre de 2030
    const cashFlow2030 = cashFlowAccumulatedRow?.[72]; // Columna diciembre 2030 (asumiendo índice de columna)

    // Pregunta 7: Monto de vivienda
    const viviendaValue = parseFloat(cashFlow2030) * 2.5;

    // Pregunta 8: Evaluar TIR del negocio
    const tirSheet = workbook.Sheets["TIR Negocio"];
    const tirData = XLSX.utils.sheet_to_json(tirSheet);
    const tirValue = tirData.find(
      (row) => row["Periodo negocio persona"] === "TIR"
    )?.[0];
    const isBusinessViable = tirValue > wacc;

    // Devolver las respuestas
    return {
      question1: `El flujo de caja en 2025 es ${question1}`,
      question2: categoryTotals,
      question3: `WACC: ${Math.round(wacc * 100)}%`,
      question4: {
        totalDebt,
        annualInterest,
      },
      question6: `Flujo de caja acumulado a diciembre 2030: ${cashFlow2030}`,
      question7: `Monto de vivienda posible: ${viviendaValue}`,
      question8: `El negocio es ${
        isBusinessViable ? "viable" : "no viable"
      } con una TIR de ${tirValue}`,
    };
  } catch (error) {
    console.error("Error reading Excel file:", error.message);
  }
}
