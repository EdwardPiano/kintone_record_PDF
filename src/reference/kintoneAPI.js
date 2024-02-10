/* eslint-disable import/no-extraneous-dependencies */
import { KintoneRestAPIClient } from '@kintone/rest-api-client'
import Constants from './Constants'

const client = new KintoneRestAPIClient({
  // Use API token authentication
  auth: { apiToken: `${Constants.PDF_TEMP_TOKEN},${Constants.PDF_TOKEN}` },
})

export default class kintoneAPI {
  static getRecords = async (AppID, QUERY) => {
    const data = await client.record.getRecords({ app: AppID, query: QUERY })
    return data
  }

  static downloadFile = async (fileKey) => {
    const data = await client.file.downloadFile({
      fileKey,
    })
    return data
  }
}
