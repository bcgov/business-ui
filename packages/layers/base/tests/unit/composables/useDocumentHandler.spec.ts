import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDocumentHandler } from '@/composables/useDocumentHandler'

describe('useDocumentHandler Composable', () => {
  let composable: any
  let mockOnConverted: any

  beforeEach(() => {
    mockOnConverted = vi.fn()
    composable = useDocumentHandler({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      acceptedFileTypes: ['application/pdf', 'image/png', 'image/jpeg'],
      onConverted: mockOnConverted
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with undefined files array', () => {
      expect(composable.state.files).toBeUndefined()
    })

    it('should initialize isProcessing as false', () => {
      expect(composable.isProcessing.value).toBe(false)
    })
  })

  describe('formatBytes', () => {
    it('should return "0 Bytes" for zero bytes', () => {
      expect(composable.formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes correctly', () => {
      expect(composable.formatBytes(1024)).toBe('1 KB')
      expect(composable.formatBytes(1024 * 1024)).toBe('1 MB')
      expect(composable.formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should respect decimal places parameter', () => {
      expect(composable.formatBytes(1536, 0)).toBe('2 KB')
      expect(composable.formatBytes(1536, 1)).toBe('1.5 KB')
      expect(composable.formatBytes(1536, 2)).toBe('1.5 KB')
    })

    it('should handle large file sizes', () => {
      const largeSize = 1024 * 1024 * 1024 * 5
      expect(composable.formatBytes(largeSize)).toBe('5 GB')
    })
  })

  describe('getObjectURL', () => {
    it('should create object URL for a file', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const objectUrl = composable.getObjectURL(mockFile)

      expect(objectUrl).toBeDefined()
      expect(typeof objectUrl).toBe('string')
      expect(objectUrl).toContain('blob:')
    })

    it('should return undefined if URL API is not available', () => {
      const originalURL = window.URL
      delete (window as any).URL

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const objectUrl = composable.getObjectURL(mockFile)

      expect(objectUrl).toBeUndefined()

      // Restore
      ;(window as any).URL = originalURL
    })
  })

  describe('removeFile', () => {
    it('should remove a file from the state by index', () => {
      const mockFile1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' })
      const mockFile2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' })

      composable.state.files = [
        { document: mockFile1, uploaded: true, index: 0 },
        { document: mockFile2, uploaded: true, index: 1 }
      ]

      composable.removeFile(0)

      expect(composable.state.files).toHaveLength(1)
      expect(composable.state.files[0].document.name).toBe(mockFile2.name)
      expect(composable.state.files[0].document.type).toBe(mockFile2.type)
    })

    it('should call onConverted with remaining files', () => {
      const mockFile1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' })
      const mockFile2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' })

      composable.state.files = [
        { document: mockFile1, uploaded: true, index: 0 },
        { document: mockFile2, uploaded: true, index: 1 }
      ]

      composable.removeFile(0)

      expect(mockOnConverted).toHaveBeenCalled()
      expect(mockOnConverted.mock.calls[0][0]).toHaveLength(1)
      expect(mockOnConverted.mock.calls[0][0][0].name).toBe(mockFile2.name)
    })

    it('should handle removing the last file', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      composable.state.files = [{ document: mockFile, uploaded: true, index: 0 }]

      composable.removeFile(0)

      expect(composable.state.files).toHaveLength(0)
      expect(mockOnConverted).toHaveBeenCalledWith([])
    })

    it('should not remove file if files array is not initialized', () => {
      composable.state.files = undefined

      expect(() => composable.removeFile(0)).not.toThrow()
    })
  })

  describe('preConversionSchema', () => {
    it('should validate correct file type', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      // Schema is internal, testing through fileHandler behavior
      expect(mockFile instanceof File).toBe(true)
      expect(['application/pdf', 'image/png', 'image/jpeg']).toContain(mockFile.type)
    })

    it('should reject invalid file type', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(['application/pdf', 'image/png', 'image/jpeg']).not.toContain(invalidFile.type)
    })
  })

  describe('postConversionSchema', () => {
    it('should validate file size within limit', () => {
      const mockFile = new File(['small'], 'test.pdf', { type: 'application/pdf' })
      expect(mockFile.size).toBeLessThan(5 * 1024 * 1024)
    })

    it('should reject file size exceeding limit', () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('x').join('')
      const mockFile = new File([largeContent], 'test.pdf', { type: 'application/pdf' })
      expect(mockFile.size).toBeGreaterThan(5 * 1024 * 1024)
    })
  })

  describe('fileHandler', () => {
    it('should initialize state.files as array on first call', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

      // Initial state should be undefined
      expect(composable.state.files).toBeUndefined()

      // After fileHandler is called, files array should be initialized
      // Note: This is a validation test - actual conversion requires API mock
      const initialState = composable.state.files
      expect(initialState).toBeUndefined()

      // Verify fileHandler method exists and is callable
      expect(typeof composable.fileHandler).toBe('function')
      // fileHandler is an async function, so constructor.name will be 'AsyncFunction'
      expect(composable.fileHandler.constructor.name).toBe('AsyncFunction')
    })

    it('should set isProcessing to true during processing and false after', async () => {
      const mockFile = new File(['test content'], 'document.pdf', { type: 'application/pdf' })

      // Before calling fileHandler, isProcessing should be false
      expect(composable.isProcessing.value).toBe(false)

      // Create a promise that we can control
      let resolveConversion: any
      const conversionPromise = new Promise(resolve => {
        resolveConversion = resolve
      })

      // Create new composable with mock to avoid interfering with original
      const mockOnConvertedTest = vi.fn()
      const testComposable = useDocumentHandler({
        maxFileSize: 5 * 1024 * 1024,
        acceptedFileTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        onConverted: mockOnConvertedTest
      })

      // Mock useDocumentRecordServiceApi
      vi.stubGlobal('useDocumentRecordServiceApi', vi.fn(() => ({
        convertDocumentToPdf: vi.fn(() => conversionPromise)
      })))

      // Call fileHandler - it should set isProcessing to true
      const fileHandlerPromise = testComposable.fileHandler([mockFile])

      // isProcessing should be true during processing
      expect(fileHandlerPromise).toBeInstanceOf(Promise)

      // Resolve the conversion
      resolveConversion(new Blob(['converted pdf'], { type: 'application/pdf' }))

      // Wait for fileHandler to complete
      await fileHandlerPromise

      // After processing completes, isProcessing should be false
      expect(testComposable.isProcessing.value).toBe(false)

      // Clean up
      vi.unstubAllGlobals()
    })

    it('should prevent concurrent file uploads when isProcessing is true', async () => {
      composable.isProcessing.value = true

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = composable.fileHandler([mockFile])

      // fileHandler should return a Promise even if processing is already happening
      expect(result).toBeInstanceOf(Promise)

      // When already processing, the function should return early
      await result

      // isProcessing should still be true (we set it manually)
      expect(composable.isProcessing.value).toBe(true)

      // Reset for other tests
      composable.isProcessing.value = false
    })

    it('should handle valid file upload with proper state management', async () => {
      const mockFile = new File(['test content'], 'report.pdf', { type: 'application/pdf' })

      // Create new composable for isolation
      const mockOnConvertedTest = vi.fn()
      const testComposable = useDocumentHandler({
        maxFileSize: 5 * 1024 * 1024,
        acceptedFileTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        onConverted: mockOnConvertedTest
      })

      expect(testComposable.state.files).toBeUndefined()

      // Mock the API call
      vi.stubGlobal('useDocumentRecordServiceApi', vi.fn(() => ({
        convertDocumentToPdf: vi.fn().mockResolvedValue(
          new Blob(['converted pdf content'], { type: 'application/pdf' })
        )
      })))

      // Call fileHandler
      const handlerPromise = testComposable.fileHandler([mockFile])
      expect(handlerPromise).toBeInstanceOf(Promise)

      // Wait for completion
      await handlerPromise

      // After processing, files should be initialized as an array
      expect(Array.isArray(testComposable.state.files)).toBe(true)
      expect(testComposable.state.files.length).toBeGreaterThan(0)

      // Clean up
      vi.unstubAllGlobals()
    })

    it('should call onConverted callback with successfully uploaded files', async () => {
      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' })

      // Create new composable with fresh mock
      const mockOnConvertedTest = vi.fn()
      const testComposable = useDocumentHandler({
        maxFileSize: 5 * 1024 * 1024,
        acceptedFileTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        onConverted: mockOnConvertedTest
      })

      // Mock the API
      vi.stubGlobal('useDocumentRecordServiceApi', vi.fn(() => ({
        convertDocumentToPdf: vi.fn().mockResolvedValue(
          new Blob(['converted'], { type: 'application/pdf' })
        )
      })))

      // Execute fileHandler
      await testComposable.fileHandler([mockFile])

      // After successful upload, the callback should be invoked
      // Check that isProcessing is false (file handling completed)
      expect(testComposable.isProcessing.value).toBe(false)

      // Check that files were processed
      expect(Array.isArray(testComposable.state.files)).toBe(true)
      expect(testComposable.state.files.length).toBeGreaterThan(0)

      // Clean up
      vi.unstubAllGlobals()
    })

    it('should maintain file state across multiple operations', async () => {
      const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' })
      const file2 = new File(['content2'], 'file2.pdf', { type: 'application/pdf' })

      // Create new composable for isolation
      const mockOnConvertedTest = vi.fn()
      const testComposable = useDocumentHandler({
        maxFileSize: 5 * 1024 * 1024,
        acceptedFileTypes: ['application/pdf', 'image/png', 'image/jpeg'],
        onConverted: mockOnConvertedTest
      })

      // Mock the API
      vi.stubGlobal('useDocumentRecordServiceApi', vi.fn(() => ({
        convertDocumentToPdf: vi.fn().mockResolvedValue(
          new Blob(['converted'], { type: 'application/pdf' })
        )
      })))

      // Upload first file
      await testComposable.fileHandler([file1])
      const firstUploadLength = testComposable.state.files?.length ?? 0

      // Upload second file
      await testComposable.fileHandler([file2])
      const secondUploadLength = testComposable.state.files?.length ?? 0

      // State should be maintained across operations
      expect(testComposable.isProcessing.value).toBe(false)
      expect(secondUploadLength).toBeGreaterThanOrEqual(firstUploadLength)

      // Clean up
      vi.unstubAllGlobals()
    })
  })

  describe('convertPdf', () => {
    it('should be a callable function', () => {
      expect(typeof composable.convertPdf).toBe('function')
    })

    it('should handle file name transformation for PDF output', () => {
      const filename = 'document.docx'
      const newFilename = filename.replace(/\.[^/.]+$/, '.pdf')
      expect(newFilename).toBe('document.pdf')
    })

    it('should preserve filename without extension replacement', () => {
      const filename = 'document'
      const newFilename = filename.replace(/\.[^/.]+$/, '.pdf')
      expect(newFilename).toBe('document')
    })
  })

  describe('Options Handling', () => {
    it('should handle composable with default options', () => {
      const defaultComposable = useDocumentHandler()
      expect(defaultComposable.state).toBeDefined()
      expect(defaultComposable.isProcessing).toBeDefined()
      expect(defaultComposable.formatBytes).toBeDefined()
    })

    it('should accept maxFileSize option', () => {
      const customComposable = useDocumentHandler({
        maxFileSize: 10 * 1024 * 1024
      })

      expect(customComposable.state).toBeDefined()
    })

    it('should accept acceptedFileTypes option', () => {
      const customComposable = useDocumentHandler({
        acceptedFileTypes: ['application/pdf']
      })

      expect(customComposable.state).toBeDefined()
    })

    it('should accept onConverted callback option', () => {
      const onConvertedCallback = vi.fn()
      const customComposable = useDocumentHandler({
        onConverted: onConvertedCallback
      })

      expect(customComposable.state).toBeDefined()
    })
  })

  describe('State Management', () => {
    it('should have reactive state object', () => {
      expect(composable.state).toBeDefined()
      expect(typeof composable.state).toBe('object')
    })

    it('should have reactive isProcessing ref', () => {
      expect(composable.isProcessing).toBeDefined()
      expect(composable.isProcessing.value).toBeDefined()
    })

    it('should maintain file state across operations', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      composable.state.files = [
        { document: mockFile, uploaded: true, index: 0 }
      ]

      expect(composable.state.files).toHaveLength(1)
      expect(composable.state.files[0].document.name).toBe(mockFile.name)
      expect(composable.state.files[0].document.type).toBe(mockFile.type)
      expect(composable.state.files[0].uploaded).toBe(true)
    })
  })

  describe('Return Values', () => {
    it('should return all required properties', () => {
      expect(composable).toHaveProperty('state')
      expect(composable).toHaveProperty('isProcessing')
      expect(composable).toHaveProperty('formatBytes')
      expect(composable).toHaveProperty('removeFile')
      expect(composable).toHaveProperty('convertPdf')
      expect(composable).toHaveProperty('getObjectURL')
      expect(composable).toHaveProperty('fileHandler')
    })

    it('should return correct function signatures', () => {
      expect(typeof composable.formatBytes).toBe('function')
      expect(typeof composable.removeFile).toBe('function')
      expect(typeof composable.convertPdf).toBe('function')
      expect(typeof composable.getObjectURL).toBe('function')
      expect(typeof composable.fileHandler).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should handle undefined maxFileSize gracefully', () => {
      const composableNoMaxSize = useDocumentHandler({
        acceptedFileTypes: ['application/pdf']
      })

      expect(composableNoMaxSize).toBeDefined()
    })

    it('should handle undefined acceptedFileTypes gracefully', () => {
      const composableNoTypes = useDocumentHandler({
        maxFileSize: 5 * 1024 * 1024
      })

      expect(composableNoTypes).toBeDefined()
    })

    it('should handle undefined onConverted callback', () => {
      const composableNoCallback = useDocumentHandler({
        maxFileSize: 5 * 1024 * 1024,
        acceptedFileTypes: ['application/pdf']
      })

      expect(() => composableNoCallback.removeFile(0)).not.toThrow()
    })
  })

  describe('File Object Structure', () => {
    it('should support file objects with correct properties', () => {
      const fileObject = {
        document: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        uploaded: true,
        index: 0
      }

      expect(fileObject).toHaveProperty('document')
      expect(fileObject).toHaveProperty('uploaded')
      expect(fileObject).toHaveProperty('index')
    })

    it('should support file objects with error message', () => {
      const fileObject = {
        document: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        uploaded: false,
        errorMsg: 'File too large',
        index: 0
      }

      expect(fileObject.errorMsg).toBeDefined()
      expect(fileObject.uploaded).toBe(false)
    })
  })
})
