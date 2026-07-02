/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FormDocumentUpload } from '#components'

const mockT = vi.fn((key: string) => key)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

describe('FormDocumentUpload Component', () => {
  describe('Props', () => {
    it('should render with default props', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept custom uploadLabel prop', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          uploadLabel: 'Custom Upload Label'
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.props('uploadLabel')).toBe('Custom Upload Label')
    })

    it('should accept validate prop', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          validate: true
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.props('validate')).toBe(true)
    })

    it('should accept multipleFiles prop', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          multipleFiles: false
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.props('multipleFiles')).toBe(false)
    })

    it('should accept maxFileSize prop', async () => {
      const maxSize = 5 * 1024 * 1024 // 5MB

      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          maxFileSize: maxSize
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.props('maxFileSize')).toBe(maxSize)
    })

    it('should accept acceptedFileTypes prop', async () => {
      const fileTypes = ['application/pdf', 'image/png']

      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          acceptedFileTypes: fileTypes
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.props('acceptedFileTypes')).toEqual(fileTypes)
    })
  })

  describe('Emits', () => {
    it('should have converted-files emit defined', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.vm.$options.emits).toBeDefined()
    })
  })

  describe('Computed Properties', () => {
    it('should compute uploadDescription correctly', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          acceptedFileTypes: ['application/pdf', 'image/png'],
          maxFileSize: 3 * 1024 * 1024
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      const uploadDesc = (wrapper.vm as any).uploadDescription
      expect(uploadDesc).toContain('.pdf')
      expect(uploadDesc).toContain('.png')
    })

    it('should compute hasValidUploadedFile as false when no files', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect((wrapper.vm as any).hasValidUploadedFile).toBe(false)
    })

    it('should show validation error when validate is true and no valid files', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          validate: true
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect((wrapper.vm as any).showValidationError).toBe(true)
    })

    it('should not show validation error when validate is false', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          validate: false
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect((wrapper.vm as any).showValidationError).toBe(false)
    })
  })

  describe('Mobile Detection', () => {
    it('should set isMobile to true on small screens', async () => {
      const vueuse = await import('@vueuse/core')
      const spy = vi.spyOn(vueuse, 'useMediaQuery').mockReturnValue(computed(() => true))

      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect((wrapper.vm as any).isMobile).toBe(true)
      spy.mockRestore()
    })

    it('should set isMobile to false on large screens', async () => {
      global.innerWidth = 1024

      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect((wrapper.vm as any).isMobile).toBe(false)
    })
  })

  describe('File Upload Configuration', () => {
    it('should apply validation styles when validation is enabled and no files', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {
          validate: true
        },
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      const config = (wrapper.vm as any).fileUploadFileConfig
      expect(config.label).toBe('text-error')
      expect(config.base).toBe('border-error')
    })

    it('should apply mobile file grid when on mobile', async () => {
      const vueuse = await import('@vueuse/core')
      const spy = vi.spyOn(vueuse, 'useMediaQuery').mockReturnValue(computed(() => true))

      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      expect((wrapper.vm as any).isMobile).toBe(true)
      spy.mockRestore()
    })
  })

  describe('Mobile Input Handlers', () => {
    it('should handle mobile picture input changes', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const event = {
        target: {
          files: [mockFile]
        }
      }

      const mph = (wrapper.vm as any).mobilePictureHandler
      mph(event)

      expect((wrapper.vm as any).state.files).toBeDefined()
      expect((wrapper.vm as any).state.files.length).toBeGreaterThan(0)
    })

    it('should append files to existing files array', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      const mockFile1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' })
      const mockFile2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' })

      let event = {
        target: {
          files: [mockFile1]
        }
      }
      const mph1 = (wrapper.vm as any).mobilePictureHandler
      mph1(event)

      event = {
        target: {
          files: [mockFile2]
        }
      }
      const mph2 = (wrapper.vm as any).mobilePictureHandler
      mph2(event)

      expect((wrapper.vm as any).state.files).toHaveLength(2)
      expect((wrapper.vm as any).state.files[0].document.name).toBe(mockFile1.name)
      expect((wrapper.vm as any).state.files[1].document.name).toBe(mockFile2.name)
    })
  })

  describe('Menu Items', () => {
    it('should have correct mobile menu items', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      const menuItems = (wrapper.vm as any).mobileMenuItems
      expect(menuItems).toHaveLength(3)
      expect(menuItems[0].label).toBe('Photos')
      expect(menuItems[1].label).toBe('Camera')
      expect(menuItems[2].label).toBe('Files')
    })
  })

  describe('Input Trigger', () => {
    it('should trigger camera input when triggerInput is called with cameraInput', async () => {
      const vueuse = await import('@vueuse/core')
      vi.spyOn(vueuse, 'useMediaQuery').mockReturnValue(computed(() => true))

      const wrapper = await mountSuspended(FormDocumentUpload)

      const cameraInputElement = wrapper.find('input[capture="environment"]').element as HTMLInputElement
      const clickSpy = vi.spyOn(cameraInputElement, 'click')
      await (wrapper.vm as any).triggerInput('cameraInput')
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('Default Props', () => {
    it('should have correct default values', async () => {
      const wrapper = await mountSuspended(FormDocumentUpload, {
        props: {},
        global: {
          stubs: {
            UForm: true,
            UFormField: true,
            UFileUpload: true,
            UButton: true,
            UIcon: true,
            UProgress: true,
            UDropdownMenu: true
          }
        }
      })

      expect(wrapper.props('validate')).toBe(false)
      expect(wrapper.props('uploadLabel')).toBe('Upload Files')
      expect(wrapper.props('multipleFiles')).toBe(true)
      expect(wrapper.props('maxFileSize')).toBe(3 * 1024 * 1024)
      expect(wrapper.props('acceptedFileTypes')).toEqual([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif'
      ])
    })
  })
})
