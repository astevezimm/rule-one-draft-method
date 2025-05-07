import {ChangeEvent} from 'react'

type UploadScreenshotProps = {
  image?: ArrayBuffer | null
  index: number
  onChangeImage: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function UploadScreenshot({image, index, onChangeImage}: UploadScreenshotProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => document.getElementById(`map-file-${index}`)?.click()}
        title={image ? "Update screenshot" : "Upload a screenshot"}
      >
        {image ? '✅' : '📷'}
      </button>
      <input
        type="file"
        id={`map-file-${index}`}
        style={{ display: 'none' }}
        accept="image/*"
        data-index={index}
        onChange={onChangeImage}
      />
    </>
  )
}
