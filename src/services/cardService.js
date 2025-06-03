/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, attachmentFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      // Xử lý upload ảnh cover
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if (attachmentFile) {
      // Xử lý upload file đính kèm
      const uploadResult = await CloudinaryProvider.streamUpload(attachmentFile.buffer, 'card-attachments')

      // Decode filename để đảm bảo hiển thị đúng Unicode
      const decodedFileName = decodeURIComponent(escape(attachmentFile.originalname))

      const attachmentData = {
        fileName: decodedFileName,
        fileUrl: uploadResult.secure_url,
        fileType: attachmentFile.mimetype,
        uploadedAt: Date.now(),
        uploadedBy: userInfo._id
      }
      updatedCard = await cardModel.pushNewAttachment(cardId, attachmentData)
    } else if (updateData.commentToAdd) {
      // Xử lý thêm comment
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      // Xử lý thêm/xóa thành viên
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      // Các trường hợp update thông thường
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
