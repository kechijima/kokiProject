let sheetRange = "経費科目!A3:A";

const getVars = () => {
    const SPREAD_SHEET_ID = "1O-QM0aFezydz2RPQa6s7VVKSDyDNLeAYD1ckjj84L_k";
    const GOOGLE_API_KEY = "AIzaSyCb0lSLQwbrNesBm3jPfkoIIMdtFLlQh-o";

    return { SPREAD_SHEET_ID, GOOGLE_API_KEY }
}

export async function allRows() {
    sheetRange = "経費科目!A3:A";
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();
    const url = 
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${sheetRange}?key=${GOOGLE_API_KEY}`
    return await useFetch(url)
}

export async function getProjectRows() {
    sheetRange = "案件!A2:A";
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();
    const url = 
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${sheetRange}?key=${GOOGLE_API_KEY}`
    return await useFetch(url)
}

export async function singleRow(row) {
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();

    const rowRange = `Sheet1!A${row}:D${row}`

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${rowRange}?key=${GOOGLE_API_KEY}`
    return await useFetch(url)
}