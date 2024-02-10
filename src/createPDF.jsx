/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
/* eslint-disable camelcase */

// 創建和修改PDF文件
import { degrees, PDFDocument, rgb, StandardFonts, PDFTextField } from 'pdf-lib'
// 用於處理字體的庫
import fontkit from '@pdf-lib/fontkit'
// kintone SDK
import kintoneAPI from './reference/kintoneAPI'
// 常量
import Constants from './reference/Constants'

// 獲取PDF檔案
const getPDF_File = async (record) => {
  // 取PDF模板
  const files = record[`${Constants.PDF_TEMP_FILECODE}`].value
  // 判斷附件中是否有檔案
  if (files.length <= 0) {
    throw new Error('PDF模板資料不存在，請上傳模板至指定應用程式後再次嘗試。')
  }
  // 獲取附件中第一個檔案
  const { fileKey } = files[0]
  // 下載附件檔案
  const arrayBuffer = await kintoneAPI.downloadFile(fileKey)
  return arrayBuffer
}

// 設定kintone資料到pdf中，並保存
const set_kitoneDataOnPDF = async (event) => {
  // 1.取的kintone record資料
  const getPDFTempQuery = `${Constants.PDF_TEMP_NAMECODE} = "${Constants.PDF_TEMP_TARGET_NAME}"`
  const resp = await kintoneAPI.getRecords(Constants.PDF_TEMP_APPID, getPDFTempQuery)
  if (resp.records.length <= 0) {
    throw new Error('模板記錄資料不存在，請確認模板名稱正確。')
  }
  const tempRecord = resp.records[0]
  const pdfArrayBuffer = await getPDF_File(tempRecord)

  // 使用 pdf-lib 讀取PDF模板
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer)
  // 建立 pdf-lib 字體(本身不支援中文、日文、韓文 等) 將Fontkit庫註冊到PDF-lib中
  pdfDoc.registerFontkit(fontkit)

  // 加载自定義字體
  const fontBytes = await fetch(Constants.fontUrl).then((res) => res.arrayBuffer())
  // 將字體嵌入到 pdfDoc 對象中
  const customFont = await pdfDoc.embedFont(fontBytes)

  // 取得pdf表、欄位(PDF檔案必須為經過扁平化)
  const form = pdfDoc.getForm() // 獲取表單
  const fields = form.getFields() // 獲取字段(包含label、按鈕等等)
  // 將獲取到的動態欄位循環(前提:欄位的name和kintone的欄位代碼一致)
  fields.forEach((field) => {
    const name = field.getName()
    const targetField = event.record[name]
    if (targetField && targetField.value && targetField.value.length > 0 && field instanceof PDFTextField) {
      const textField = form.getTextField(name) // 只獲取文本字段
      let value = targetField.type === 'USER_SELECT' ? targetField.value[0].name : targetField.value
      if (typeof value === 'string' || typeof value === 'number') {
        // 如果是數值加上金額進位符
        if (!isNaN(value)) {
          value = Number(value).toLocaleString()
        }
        textField.setText(value)
        textField.setFontSize(12)
        textField.updateAppearances(customFont)
      }
    }
  })
  // 獲取表格資料
  let tableText = ''
  const produceTable = event.record['商品內容']
  produceTable.value.forEach((rowObj) => {
    tableText += Constants.formatObject(rowObj.value)
  })
  console.log(tableText)
  const tableField = form.getTextField('商品內容')
  tableField.setText(tableText)
  tableField.setFontSize(12)
  tableField.updateAppearances(customFont)
  // pdf扁平化(不可逆，將不可再操作動態欄位數據)
  form.flatten()
  // 將更新後的檔案保存後轉url
  const pdfBytes = await pdfDoc.save() // 將PDF文檔保存為二進制數據
  // 創建PDF文檔二進制數據的URL
  const href = URL.createObjectURL(
    new Blob([pdfBytes], {
      type: 'application/pdf',
    }),
  )
  console.log(href)
  return href
}

export { set_kitoneDataOnPDF }
