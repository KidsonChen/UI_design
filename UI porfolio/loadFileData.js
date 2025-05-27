type="text/javascript"
        var gk_isXlsx = false;
        var gk_xlsxFileLookup = {};
        var gk_fileData = {};
        function filledCell(cell) {
          return cell !== '' && cell != null;
        }
        function loadFileData(filename) {
        if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
            try {
                var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];

                // 將工作表轉換為 JSON 格式，以便過濾空白列
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
                // 過濾掉空白列（即所有儲存格皆為空字串、null 或 undefined 的資料列）
                var filteredData = jsonData.filter(row => row.some(filledCell));

                // 尋找標題列的啟發式方法：忽略那些已填儲存格數量少於其後一列的資料列
                var headerRowIndex = filteredData.findIndex((row, index) =>
                  row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
                );
                // 若找不到，則使用預設值
                if (headerRowIndex === -1 || headerRowIndex > 25) {
                  headerRowIndex = 0;
                }

                // 將過濾後的 JSON 資料轉換回 CSV 格式
                var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // 從已過濾的陣列的陣列（Array of Arrays）建立新的工作表
                csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
                return csv;
            } catch (e) {
                console.error(e);
                return "";
            }
        }
        return gk_fileData[filename] || "";
        }
