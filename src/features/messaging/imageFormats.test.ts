import { describe, expect, it, vi } from 'vitest'
import { isWebDisplayableImage, prepareImageForSending, withJpegExtension } from './imageFormats'

function makeFile(name: string, type: string) {
  return new File(['x'], name, { type })
}

describe('isWebDisplayableImage', () => {
  it.each(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/bmp'])('accepts %s', (type) => {
    expect(isWebDisplayableImage(makeFile('a', type))).toBe(true)
  })

  it('is not case sensitive', () => {
    expect(isWebDisplayableImage(makeFile('a.jpg', 'IMAGE/JPEG'))).toBe(true)
  })

  it.each(['image/heic', 'image/heif', 'image/tiff', 'image/vnd.adobe.photoshop', 'image/x-icon', ''])(
    'rejects %j because most browsers cannot draw it',
    (type) => {
      expect(isWebDisplayableImage(makeFile('a', type))).toBe(false)
    },
  )
})

describe('withJpegExtension', () => {
  it('swaps the extension for .jpg', () => {
    expect(withJpegExtension('IMG_0001.HEIC')).toBe('IMG_0001.jpg')
  })

  it('keeps dots inside the name', () => {
    expect(withJpegExtension('holiday.2026.heic')).toBe('holiday.2026.jpg')
  })

  it('adds an extension when there is none', () => {
    expect(withJpegExtension('photo')).toBe('photo.jpg')
  })
})

describe('prepareImageForSending', () => {
  it('sends a displayable image untouched without trying to convert it', async () => {
    const convert = vi.fn()
    const file = makeFile('shot.png', 'image/png')

    expect(await prepareImageForSending(file, convert)).toBe(file)
    expect(convert).not.toHaveBeenCalled()
  })

  it('converts an iPhone HEIC photo when the browser can decode it', async () => {
    const jpeg = makeFile('IMG_0001.jpg', 'image/jpeg')
    const convert = vi.fn().mockResolvedValue(jpeg)
    const heic = makeFile('IMG_0001.heic', 'image/heic')

    expect(await prepareImageForSending(heic, convert)).toBe(jpeg)
    expect(convert).toHaveBeenCalledWith(heic)
  })

  it('tries to convert a file whose type the browser could not name', async () => {
    const jpeg = makeFile('IMG.jpg', 'image/jpeg')
    const convert = vi.fn().mockResolvedValue(jpeg)

    expect(await prepareImageForSending(makeFile('IMG.heic', ''), convert)).toBe(jpeg)
  })

  it('returns null when the browser cannot decode it, so the caller can send it as a plain file', async () => {
    const convert = vi.fn().mockRejectedValue(new Error('cannot decode'))

    expect(await prepareImageForSending(makeFile('scan.tiff', 'image/tiff'), convert)).toBeNull()
  })
})
