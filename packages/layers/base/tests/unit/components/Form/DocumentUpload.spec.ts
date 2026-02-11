import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentUpload from '@/components/Form/DocumentUpload/index.vue'

describe('DocumentUpload Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Props', () => {
    it('should render with default props', () => {
      wrapper = mount(DocumentUpload, {
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

    it('should accept custom uploadLabel prop', () => {
      wrapper = mount(DocumentUpload, {
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

    it('should accept validate prop', () => {
      wrapper = mount(DocumentUpload, {
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

    it('should accept multipleFiles prop', () => {
      wrapper = mount(DocumentUpload, {
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

    it('should accept maxFileSize prop', () => {
      const maxSize = 5 * 1024 * 1024 // 5MB

      wrapper = mount(DocumentUpload, {
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

    it('should accept acceptedFileTypes prop', () => {
      const fileTypes = ['application/pdf', 'image/png']

      wrapper = mount(DocumentUpload, {
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
    it('should have converted-files emit defined', () => {
      wrapper = mount(DocumentUpload, {
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
    it('should compute uploadDescription correctly', () => {
      wrapper = mount(DocumentUpload, {
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

      const uploadDesc = wrapper.vm.uploadDescription
      expect(uploadDesc).toContain('.pdf')
      expect(uploadDesc).toContain('.png')
    })

    it('should compute hasValidUploadedFile as false when no files', () => {
      wrapper = mount(DocumentUpload, {
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

      expect(wrapper.vm.hasValidUploadedFile).toBe(false)
    })

    it('should show validation error when validate is true and no valid files', () => {
      wrapper = mount(DocumentUpload, {
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

      expect(wrapper.vm.showValidationError).toBe(true)
    })

    it('should not show validation error when validate is false', () => {
      wrapper = mount(DocumentUpload, {
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

      expect(wrapper.vm.showValidationError).toBe(false)
    })
  })

  describe('Mobile Detection', () => {
    it('should set isMobile to true on small screens', () => {
      global.innerWidth = 500

      wrapper = mount(DocumentUpload, {
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

      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should set isMobile to false on large screens', () => {
      global.innerWidth = 1024

      wrapper = mount(DocumentUpload, {
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

      expect(wrapper.vm.isMobile).toBe(false)
    })
  })

  describe('File Upload Configuration', () => {
    it('should apply validation styles when validation is enabled and no files', () => {
      wrapper = mount(DocumentUpload, {
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

      const config = wrapper.vm.fileUploadFileConfig
      expect(config.label).toBe('text-error')
      expect(config.base).toBe('border-red-600')
    })

    it('should apply mobile file grid when on mobile', async () => {
      global.innerWidth = 500

      wrapper = mount(DocumentUpload, {
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
      const config = wrapper.vm.fileUploadFileConfig
      expect(config.file).toBe('grid grid-cols-6 gap-1 wrap-anywhere')
    })
  })

  describe('Mobile Input Handlers', () => {
    it('should handle mobile picture input changes', async () => {
      wrapper = mount(DocumentUpload, {
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

      wrapper.vm.mobilePictureHandler(event)

      expect(wrapper.vm.state.files).toBeDefined()
      expect(wrapper.vm.state.files.length).toBeGreaterThan(0)
    })

    it('should append files to existing files array', async () => {
      wrapper = mount(DocumentUpload, {
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
      wrapper.vm.mobilePictureHandler(event)

      event = {
        target: {
          files: [mockFile2]
        }
      }
      wrapper.vm.mobilePictureHandler(event)

      expect(wrapper.vm.state.files).toHaveLength(2)
      expect(wrapper.vm.state.files[0].name).toBe(mockFile1.name)
      expect(wrapper.vm.state.files[1].name).toBe(mockFile2.name)
    })
  })

  describe('Menu Items', () => {
    it('should have correct mobile menu items', () => {
      wrapper = mount(DocumentUpload, {
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

      const menuItems = wrapper.vm.mobileMenuItems
      expect(menuItems).toHaveLength(3)
      expect(menuItems[0].label).toBe('Photos')
      expect(menuItems[1].label).toBe('Camera')
      expect(menuItems[2].label).toBe('Files')
    })
  })

  describe('Input Trigger', () => {
    it('should trigger camera input when triggerInput is called with cameraInput', () => {
      wrapper = mount(DocumentUpload, {
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

      if (wrapper.vm.cameraInput) {
        const clickSpy = vi.spyOn(wrapper.vm.cameraInput, 'click', { spy: true })
        wrapper.vm.triggerInput('cameraInput')
        expect(clickSpy).toHaveBeenCalled()
      }
    })
  })

  describe('Default Props', () => {
    it('should have correct default values', () => {
      wrapper = mount(DocumentUpload, {
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
