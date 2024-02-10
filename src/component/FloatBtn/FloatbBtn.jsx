/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import { FilePdfOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import { notification, FloatButton, Alert, Space, Spin } from 'antd'
import React, { useState } from 'react'
import { set_kitoneDataOnPDF } from '../../createPDF'
import './FloatBtn.css'

function FloatBtn() {
  const [loading, setLoading] = useState(false)
  const [api, contextHolder] = notification.useNotification()
  const openNotification = (description) => {
    api.error({
      message: `執行發生錯誤`,
      description,
      placement: 'bottomRight',
      duration: null,
    })
  }
  // 按鈕點擊事件
  const handleClick = async () => {
    try {
      setLoading(true)
      console.log('FloatButton clicked!')
      // 獲取當筆record資料
      const event = kintone.app.record.get()
      // 在這裡添加你的點擊事件處理邏輯
      const href = await set_kitoneDataOnPDF(event)
      setLoading(false)
      // 打開(預覽)製作後的PDF
      window.open(href)
    } catch (error) {
      openNotification(error.message)
    }
  }
  return (
    <>
      {contextHolder}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{
          right: 30,
        }}
        icon={<CloudDownloadOutlined />}
      >
        {loading && (
          <div className="spin-container">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        <FloatButton icon={<FilePdfOutlined />} onClick={handleClick} />
      </FloatButton.Group>
    </>
  )
}
export default FloatBtn
