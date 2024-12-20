let sheetRange = "";

const getVars = () => {
    const SPREAD_SHEET_ID = "1oxec1rNOVNT_l0HDZkH5yu6vZL2gVLJ7TaTnkChRfwY";
    const GOOGLE_API_KEY = "AIzaSyB0_g8XdNTyfC_TApvn2ZTkZIxH8AC7ijk";

    return { SPREAD_SHEET_ID, GOOGLE_API_KEY }
}

export async function getKamokuRows() {
    sheetRange = "経費科目!A3:A";
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${sheetRange}?key=${GOOGLE_API_KEY}`
    return await useFetch(url)
}

// データを取得し、整形して返す関数
export async function getProjectData() {
    sheetRange = "事業タイプ!A2:G";
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${sheetRange}?key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error("スプレッドシートのデータ取得に失敗しました。");
    }
  
    const data = await response.json();
  
    // データを整形
    const rows = data.values || [];
    const projectMap = {};
  
    rows.forEach(([type, detail, billingType, itemId, account, invoiceTitle,bikou]) => {
        if (!projectMap[detail]) {
            projectMap[detail] = {
                type,
                billingType,
                itemId,
                account,
                invoiceTitle,
                bikou
            };
        }
    });
    console.log(projectMap);
  
    return projectMap;
  }

  export async function getClientData() {

    sheetRange = "取引先マスタ!A2:E"; // スプレッドシートの範囲
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${sheetRange}?key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
  
    try {
      if (!response.ok) {
        throw new Error("スプレッドシートデータの取得に失敗しました。");
      }
  
      const data = await response.json();
      const rows = data.values;
  
      // データ整形
      const clientMap = {};
      rows.forEach(([name, id, departmentName, departmentId, businessDetails]) => {
        if (!businessDetails) return;
  
        businessDetails.split(",").forEach((detail) => {
          const trimmedDetail = detail.trim();
          if (!clientMap[trimmedDetail]) {
            clientMap[trimmedDetail] = [];
          }
          clientMap[trimmedDetail].push({ name, id, departmentName, departmentId });
        });
      });
  
      return clientMap;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
  

export async function getAllData() {
    const { SPREAD_SHEET_ID, GOOGLE_API_KEY } = getVars();
    
    const kamokuRange = "経費科目!A3:A";
    const projectTypeRange = "事業タイプ!A2:A";
    const projectRange = "事業タイプ!B2:B";

    const kamokuUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${kamokuRange}?key=${GOOGLE_API_KEY}`;
    const projectTypeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${projectTypeRange}?key=${GOOGLE_API_KEY}`;
    const projectUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${projectRange}?key=${GOOGLE_API_KEY}`;
    
    try {
        const [kamokuResponse,projectTypeResponse, projectResponse] = await Promise.all([useFetch(kamokuUrl),useFetch(projectTypeUrl), useFetch(projectUrl)]);
        
        return {
            kamokuData: kamokuResponse.data,
            projectTypeData: projectTypeResponse.data,
            projectData: projectResponse.data,
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { error };
    }
}

