import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const userInfo = req.jwtDecoded

    // Lấy files từ req.files thay vì req.file vì sử dụng multer.fields
    const files = req.files || {}
    const cardCoverFile = files.cardCover ? files.cardCover[0] : null
    const attachmentFile = files.attachment ? files.attachment[0] : null

    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, attachmentFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update
}
